# api/views.py

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from django.contrib.auth import authenticate
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated,AllowAny
from .permissions import HasCapabilityPermission

from api.models import StaffUser,Project,ProjectFinancePart,Partner,Translation,Department
from .serializers import ProjectSerializer,StaffUserSimpleSerializer,ProjectFinancePartCreateSerializer,ProjectFinancePartSerializer,PartnerSerializer,TranslationSerializer,DepartmentSerializer
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView,ListAPIView
from api.serializers import StaffUserTokenSerializer
from django.utils.dateparse import parse_date
from django.db.models import Q
from django.db import transaction
from .pagination import ProjectsPagination,ProjectsFiancierConfirmPagination,PartnersPagination
from django.utils import timezone
from rest_framework.views import APIView



class StaffUserLoginView(TokenObtainPairView):
    serializer_class = StaffUserTokenSerializer

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            # ✅ Successful login — update last_login
            user.last_login = now()
            user.save(update_fields=["last_login"])

            refresh = RefreshToken.for_user(user)

            # ✅ Add custom claims
            refresh["user_id"] = user.user_id
            refresh["username"] = user.username
            refresh["fio"] = user.fio
            refresh["position"] = user.position,
            refresh["role"] = user.role.role_name if user.role else None
            refresh["capabilities"] = list(
                user.role.capabilities.values_list("capability_name", flat=True)
            ) if user.role else []

            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })

        # ❌ Failed login — update last_login_time_fail
        try:
            failed_user = StaffUser.objects.get(username=username)
            failed_user.last_login_time_fail = now()
            failed_user.save(update_fields=["last_login_time_fail"])
        except StaffUser.DoesNotExist:
            pass

        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)



class ProjectCreateAPIView(generics.CreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [
        IsAuthenticated,
        HasCapabilityPermission('CAN_CREATE_PROJECT'),
    ]

    def perform_create(self, serializer):
        serializer.save(create_user=self.request.user)

#for financier confirm project
class ProjectListNotificationFinancierView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [
        IsAuthenticated,
        HasCapabilityPermission('CAN_CONFIRM_PROJECT_FINANCIER'),
    ]

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(
            financier=user,
            financier_confirm=False
        )



#for notifications for prject
class ProjectListFinancierConfirmView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    pagination_class = ProjectsFiancierConfirmPagination  # 👈 shu yerda biriktiramiz
    permission_classes = [
        IsAuthenticated,
        HasCapabilityPermission('CAN_CONFIRM_PROJECT_FINANCIER'),
    ]

    def get_queryset(self):
        user = self.request.user
        financier_confirmed = self.request.query_params.get('financier_confirmed')
        print('financier_confirmed:',financier_confirmed)
        qs=Project.objects.filter(financier=user)
        if financier_confirmed == 'true':
            qs = qs.filter(financier_confirm=True).order_by('-financier_confirm_date')
        else:
            qs = qs.filter(financier_confirm=False).order_by('-create_date')
        return qs
    
    
    
    

class UsersWithCapabilityAPIView(generics.ListAPIView):
    serializer_class = StaffUserSimpleSerializer
    permission_classes = [IsAuthenticated]
    queryset = StaffUser.objects.all()  # required by DRF if you use filter_backends

    def get_queryset(self):
        cap = self.request.query_params.get('capability')
        if not cap:
            return StaffUser.objects.none()

        return StaffUser.objects.filter(
            role__capabilities__capability_name=cap
        ).distinct()
        
        
        
        



class ProjectListAPIView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    pagination_class = ProjectsPagination  # 👈 shu yerda biriktiramiz
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Project.objects.all()

        # 🔎 Filtrlarni olish
        start_date_from = self.request.query_params.get('start_date_from')
        start_date_to = self.request.query_params.get('start_date_to')
        end_date_from = self.request.query_params.get('end_date_from')
        end_date_to = self.request.query_params.get('end_date_to')
        financier_confirmed = self.request.query_params.get('financier_confirmed')
        gip_confirmed = self.request.query_params.get('gip_confirmed')

        # 📅 Sanalar bo‘yicha filter
        if start_date_from:
            qs = qs.filter(start_date__gte=parse_date(start_date_from))
        if start_date_to:
            qs = qs.filter(start_date__lte=parse_date(start_date_to))
        if end_date_from:
            qs = qs.filter(end_date__gte=parse_date(end_date_from))
        if end_date_to:
            qs = qs.filter(end_date__lte=parse_date(end_date_to))

        # ✅ Checkbox holatlari
        if financier_confirmed == 'true':
            qs = qs.filter(financier_confirm=True)
        elif financier_confirmed == 'false':
            qs = qs.filter(financier_confirm=False)

        if gip_confirmed == 'true':
            qs = qs.filter(gip_confirm=True)
        elif gip_confirmed == 'false':
            qs = qs.filter(gip_confirm=False)

        return qs.order_by('-create_date')  # so‘ngi loyihalar birinchi



class ConfirmProjectByFinancierView(APIView):
    permission_classes = [
        IsAuthenticated,
        HasCapabilityPermission('CAN_CONFIRM_PROJECT_FINANCIER'),
    ]

    def post(self, request):
        project_code = request.data.get('project_code')
        if not project_code:
            return Response({"error": "Project CODE is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            project = Project.objects.get(project_code=project_code)
        except Project.DoesNotExist:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)

        project.financier_confirm = True
        project.financier_confirm_date = timezone.now()
        project.save()

        return Response({"message": "Project confirmed successfully."}, status=status.HTTP_200_OK)
    
    
    
    
class CreateFinancialPartsView(APIView):
    permission_classes = [
        IsAuthenticated,
        HasCapabilityPermission('CAN_DIVIDE_FS_PARTS')
    ]

    def post(self, request):
        project_code = request.data.get('project_code')
        parts_data = request.data.get('parts', [])
        user = request.user

        if not project_code or not parts_data:
            return Response({'error': 'project_code and parts are required'}, status=status.HTTP_400_BAD_REQUEST)

        serialized_parts = []
        errors = []

        for idx, part in enumerate(parts_data):
            part['project_code'] = project_code
            part['create_user_id'] = user.user_id
            part['fs_part_no'] = part.get('fs_part_no') or f"Part {idx + 1}"

            serializer = ProjectFinancePartCreateSerializer(data=part)
            if serializer.is_valid():
                serialized_parts.append(serializer)
            else:
                errors.append({f"part_{idx + 1}": serializer.errors})

        if errors:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            created = [s.save() for s in serialized_parts]

        return Response({'created': [ProjectFinancePartCreateSerializer(p).data for p in created]}, status=status.HTTP_201_CREATED)
    
    
class ProjectFinancePartsListAPIView(generics.ListAPIView):
    serializer_class = ProjectFinancePartSerializer

    def get_queryset(self):
        project_code = self.kwargs.get('project_code')
        return ProjectFinancePart.objects.filter(project_code=project_code)


class ProjectFinancePartsUpdateAPIView(APIView):
    def put(self, request, project_code):
        parts_data = request.data  # expect list
        updated_parts = []

        # Collect existing part codes to delete removed ones later (optional)
        existing_parts = ProjectFinancePart.objects.filter(project_code=project_code)
        existing_ids = set(existing_parts.values_list('fs_part_code', flat=True))
        incoming_ids = set(p['fs_part_code'] for p in parts_data if p.get('fs_part_code'))

        # Optional: delete removed parts
        to_delete = existing_ids - incoming_ids
        ProjectFinancePart.objects.filter(fs_part_code__in=to_delete).delete()

        for part_data in parts_data:
            part_data['project_code'] = project_code  # ensure FK is passed

            if part_data.get('fs_part_code'):
                try:
                    part = ProjectFinancePart.objects.get(fs_part_code=part_data['fs_part_code'], project_code=project_code)
                    serializer = ProjectFinancePartSerializer(part, data=part_data)
                except ProjectFinancePart.DoesNotExist:
                    continue
            else:
                # Create new part
                serializer = ProjectFinancePartSerializer(data=part_data)

            if serializer.is_valid():
                updated_parts.append(serializer.save())
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(ProjectFinancePartSerializer(updated_parts, many=True).data, status=200)
    
    
    
class SendToTechDirAPIView(APIView):
    def put(self, request, project_code):
        # Only parts that are not already sent
        parts = ProjectFinancePart.objects.filter(
            project_code=project_code,
            send_to_tech_dir=False
        )
        count = parts.count()
        if count > 0:
            parts.update(send_to_tech_dir=True, send_to_tech_dir_date=now())
            return Response({'message': f"{count} parts sent to Tech Director."}, status=status.HTTP_200_OK)
        return Response({'message': "No new parts to send."}, status=status.HTTP_200_OK)
    
    
class ProjectListTechDirConfirmView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    pagination_class = ProjectsFiancierConfirmPagination
    permission_classes = [
        IsAuthenticated,
        HasCapabilityPermission('CAN_CHECK_AND_GIP_ATTACH'),  # Optional if needed
    ]

    def get_queryset(self):
        tech_dir_confirmed = self.request.query_params.get('tech_dir_confirmed')

        qs = Project.objects.filter(finance_parts__send_to_tech_dir=True).distinct()

        if tech_dir_confirmed == 'true':
            qs = qs.filter(finance_parts__tech_dir_confirm=True)
        elif tech_dir_confirmed == 'false':
            qs = qs.exclude(finance_parts__tech_dir_confirm=True)

        return qs.order_by('-create_date')
    
    
class PartnerListCreateView(ListCreateAPIView):
    queryset = Partner.objects.all().order_by('-update_time')
    serializer_class = PartnerSerializer
    pagination_class = PartnersPagination
    permission_classes = [IsAuthenticated,
                          HasCapabilityPermission('CAN_ADD_PARTNERS'),  # Optional if needed
                          ]

    def perform_create(self, serializer):
        serializer.save(create_user=self.request.user)


class PartnerUpdateView(RetrieveUpdateAPIView):
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
    permission_classes = [
                        IsAuthenticated,
                        HasCapabilityPermission('CAN_ADD_PARTNERS'),  # Optional if needed
                          ]
    lookup_field = 'partner_code'
    



class TranslationListView(ListAPIView):
    queryset = Translation.objects.all()
    serializer_class = TranslationSerializer
    permission_classes = [AllowAny]
    
    
class DepartmentListCreateView(ListCreateAPIView):
    queryset = Department.objects.all().order_by('-update_time')
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, HasCapabilityPermission('CAN_ADD_DEPARTMENTS')]
    pagination_class = PartnersPagination  # reuse or define similar pagination
    
    def perform_create(self, serializer):
        serializer.save(create_user=self.request.user)
        
        
class DepartmentUpdateView(RetrieveUpdateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [
        IsAuthenticated,
        HasCapabilityPermission('CAN_ADD_DEPARTMENTS'),  # adjust as needed
    ]
    lookup_field = 'department_id'