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
from datetime import datetime,date
from decimal import Decimal
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser

from api.models import StaffUser,Project,ProjectFinancePart,Partner,Translation,Department,PhaseType, ProjectPhase,ProjectGipPart,ActionLog,WorkOrder,WorkOrderFile
from .serializers import (ProjectSerializer,
                          StaffUserSimpleSerializer,
                          ProjectFinancePartCreateSerializer,
                          WorkOrderCreateSerializer,
                          ProjectFinancePartSerializer,
                          PartnerSerializer,
                          TranslationSerializer,
                          DepartmentSerializer,
                          TranslationSerializer,
                          ProjectGipPartSerializer,
                          ActionLogSerializer,
                          WorkOrderSerializer,
                          CompleteWorkOrderSerializer)
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView,ListAPIView,UpdateAPIView
from api.serializers import StaffUserTokenSerializer
from django.utils.dateparse import parse_date
from django.db.models import Count, Q,Subquery,OuterRef,F
from django.db import transaction
from .pagination import ProjectsPagination,ProjectsFiancierConfirmPagination,PartnersPagination,CompleteWorkOrderPagination,TranslationsPagination,GipConfirmPagination,ProjectListCreatePagination,ProjectGipPartPagination
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from rest_framework.filters import SearchFilter




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
        project = serializer.save(create_user=self.request.user)

        created_phase_type = PhaseType.objects.get(key='CREATED')
        sent_to_financier_phase_type = PhaseType.objects.get(key='SENT_TO_FINANCIER')

        ProjectPhase.objects.bulk_create([
            ProjectPhase(
                project=project,
                phase_type=created_phase_type,
                performed_by=self.request.user
            ),
            ProjectPhase(
                project=project,
                phase_type=sent_to_financier_phase_type,
                performed_by=self.request.user,
                notify_to=project.financier
            )
        ])

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
        search = self.request.query_params.get('search')
        total_price_from = self.request.query_params.get('total_price_from')
        total_price_to = self.request.query_params.get('total_price_to')
        print('total_price_from:',total_price_from)

        # 📅 Sanalar bo‘yicha filter
        if start_date_from:
            qs = qs.filter(start_date__gte=parse_date(start_date_from))
        if start_date_to:
            qs = qs.filter(start_date__lte=parse_date(start_date_to))
        if end_date_from:
            qs = qs.filter(end_date__gte=parse_date(end_date_from))
        if end_date_to:
            qs = qs.filter(end_date__lte=parse_date(end_date_to))
        if total_price_from and total_price_from.isdigit():
            qs = qs.filter(total_price__gte=int(total_price_from))
        if total_price_to and total_price_to.isdigit():
            qs = qs.filter(total_price__lte=int(total_price_to))
        if search:
            qs = qs.filter(project_name__icontains=search)

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



class ProjectListCreateView(ListCreateAPIView):
    serializer_class = ProjectSerializer
    pagination_class = ProjectListCreatePagination
    permission_classes = [
        IsAuthenticated,
        HasCapabilityPermission('CAN_CREATE_PROJECT')  # Optional: adjust based on your needs
    ]

    def get_queryset(self):
        queryset = Project.objects.all().order_by('-create_date')
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(Q(project_name__icontains=search))
        return queryset

    def perform_create(self, serializer):
        start_date = serializer.validated_data.get('start_date')
        end_date = serializer.validated_data.get('end_date')

        if start_date >= end_date:
            raise ValidationError({'end_date': 'Дата окончания должна быть позже даты начала'})#End date must be after start date.
        if date.today() > end_date:
            raise ValidationError({'end_date': 'Дата окончания должна быть сегодня или в будущем.'})#End date must be today or in the future.

        project = serializer.save(create_user=self.request.user)

        created_phase_type = PhaseType.objects.get(key='CREATED')
        sent_to_financier_phase_type = PhaseType.objects.get(key='SENT_TO_FINANCIER')

        ProjectPhase.objects.bulk_create([
            ProjectPhase(
                project=project,
                phase_type=created_phase_type,
                performed_by=self.request.user
            ),
            ProjectPhase(
                project=project,
                phase_type=sent_to_financier_phase_type,
                performed_by=self.request.user,
                notify_to=project.financier
            )
        ])



class ProjectRetrieveUpdateView(RetrieveUpdateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [
        IsAuthenticated,
        HasCapabilityPermission('CAN_CREATE_PROJECT')  # Optional: adjust based on your needs
    ]
    lookup_field = 'project_code'

    def perform_update(self, serializer):
        project = serializer.instance
        start_date = serializer.validated_data.get('start_date')
        end_date = serializer.validated_data.get('end_date')

        if start_date >= end_date:
            raise ValidationError({'end_date': 'Дата окончания должна быть позже даты начала'})#End date must be after start date.
        if date.today() > end_date:
            raise ValidationError({'end_date': 'Дата окончания должна быть сегодня или в будущем.'})#End date must be today or in the future.

        serializer.save()



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

        # Update project fields
        project.financier_confirm = True
        project.financier_confirm_date = timezone.now()
        project.save()

        # Log project phase
        try:
            phase_type = PhaseType.objects.get(key='FINANCIER_CONFIRMED')
        except PhaseType.DoesNotExist:
            return Response({"error": "PhaseType 'FINANCIER_CONFIRMED' not found."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        ProjectPhase.objects.create(
            project=project,
            phase_type=phase_type,
            performed_by=request.user
        )

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

        try:
            project = Project.objects.get(project_code=project_code)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

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
            
            # 🔥 Add a ProjectPhase row after creation
            try:
                phase_type = PhaseType.objects.get(key='FIN_PARTS_CREATED')  # ✅ make sure this key exists
            except PhaseType.DoesNotExist:
                return Response({'error': 'PhaseType FIN_PARTS_CREATED not found'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            ProjectPhase.objects.create(
                project=project,
                phase_type=phase_type,
                performed_by=user
            )

        return Response({'created': [ProjectFinancePartCreateSerializer(p).data for p in created]}, status=status.HTTP_201_CREATED)
    
    
class ProjectFinancePartsListAPIView(generics.ListAPIView):
    serializer_class = ProjectFinancePartSerializer

    def get_queryset(self):
        project_code = self.kwargs.get('project_code')
        queryset = ProjectFinancePart.objects.filter(project_code=project_code).order_by('fs_part_code')

        send_to_tech_dir = self.request.query_params.get('send_to_tech_dir')
        if send_to_tech_dir == 'true':
            queryset = queryset.filter(send_to_tech_dir=True)

        return queryset



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
        try:
            project = Project.objects.get(project_code=project_code)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        # Only parts that are not already sent
        parts = ProjectFinancePart.objects.filter(
            project_code=project_code,
            send_to_tech_dir=False
        )
        count = parts.count()
        if count == 0:
            return Response({'message': "No new parts to send."}, status=status.HTTP_200_OK)
        with transaction.atomic():
            parts.update(send_to_tech_dir=True, send_to_tech_dir_date=now())
            # 🔥 Add ProjectPhase
            try:
                phase_type = PhaseType.objects.get(key='SENT_TO_TECH_DIR')
            except PhaseType.DoesNotExist:
                return Response({'error': 'PhaseType SENT_TO_TECH_DIR not found.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            ProjectPhase.objects.create(
                project=project,
                phase_type=phase_type,
                performed_by=request.user
            )
        return Response({'message': f"{count} parts sent to Tech Director."}, status=status.HTTP_200_OK)
    
    
class ProjectListTechDirConfirmView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    pagination_class = ProjectsFiancierConfirmPagination
    permission_classes = [
        IsAuthenticated,
        HasCapabilityPermission('CAN_CHECK_AND_GIP_ATTACH'),
    ]

    def get_queryset(self):
        tech_dir_confirmed = self.request.query_params.get('tech_dir_confirmed')

        # Base queryset: only projects with parts sent to technical director
        qs = Project.objects.filter(finance_parts__send_to_tech_dir=True).distinct()

        if tech_dir_confirmed == 'true':
            # All parts confirmed
            qs = qs.annotate(
                unconfirmed_parts=Count('finance_parts', filter=Q(finance_parts__tech_dir_confirm=False))
            ).filter(unconfirmed_parts=0)

        elif tech_dir_confirmed == 'false':
            # Some parts not confirmed → includes refused too
            qs = qs.annotate(
                total_parts=Count('finance_parts'),
                confirmed_parts=Count('finance_parts', filter=Q(finance_parts__tech_dir_confirm=True)),
            ).filter(
                confirmed_parts__lt=F('total_parts')
            )

        return qs.order_by('-create_date')
    
    

class TechDirVerifyAPIView(APIView):
    permission_classes = [
        IsAuthenticated,
        HasCapabilityPermission('CAN_CHECK_AND_GIP_ATTACH')
    ]

    def post(self, request):
        project_code = request.data.get('project_code')
        gip_user_id = request.data.get('gip_user_id')

        if not project_code or not gip_user_id:
            return Response({'error': 'Project code and GIP user are required.'}, status=400)

        try:
            project = Project.objects.get(project_code=project_code)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=404)

        with transaction.atomic():
            # ✅ Attach GIP
            project.project_gip_id = gip_user_id
            project.save()

            # ✅ Confirm all finance parts
            parts = ProjectFinancePart.objects.filter(project_code=project, send_to_tech_dir=True)
            parts.update(
                tech_dir_confirm=True,
                tech_dir_confirm_date=timezone.now()
            )

            # ✅ Phase 1: TECH_DIR_CONFIRMED_AND_ATTACHED_GIP
            phase_1 = PhaseType.objects.get(key='TECH_DIR_CONFIRMED_AND_ATTACHED_GIP')
            ProjectPhase.objects.create(
                project=project,
                phase_type=phase_1,
                performed_by=request.user,
                notify_to=project.project_gip
            )

            # ✅ Phase 2: SENT_TO_GIP
            phase_2 = PhaseType.objects.get(key='SENT_TO_GIP')
            ProjectPhase.objects.create(
                project=project,
                phase_type=phase_2,
                performed_by=request.user,
                notify_to=project.project_gip
            )

        return Response({'message': 'Project confirmed and sent to GIP.'}, status=status.HTTP_200_OK)
    
    
class TechDirRefuseAPIView(APIView):
    permission_classes = [IsAuthenticated, HasCapabilityPermission('CAN_CHECK_AND_GIP_ATTACH')]

    def post(self, request):
        project_code = request.data.get('project_code')
        comment = request.data.get('comment')

        if not project_code or not comment:
            return Response({'error': 'Project code and comment are required.'}, status=400)

        try:
            project = Project.objects.get(project_code=project_code)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=404)

        # PhaseType with key='TECH_DIR_REFUSED' must exist
        try:
            phase_type = PhaseType.objects.get(key='TECH_DIR_REFUSED')
        except PhaseType.DoesNotExist:
            return Response({'error': 'Phase type not found'}, status=500)

        ProjectPhase.objects.create(
            project=project,
            phase_type=phase_type,
            comment=comment,
            performed_by=request.user,
            notify_to=project.financier  # example: notify financier
        )

        return Response({'message': 'Refusal recorded.'}, status=200)






    
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
    





class RefuseProjectByFinancierView(APIView):
    permission_classes = [
        IsAuthenticated,
        HasCapabilityPermission('CAN_CONFIRM_PROJECT_FINANCIER'),
    ]

    def post(self, request):
        project_code = request.data.get('project_code')
        comment = request.data.get('comment')

        if not project_code or not comment:
            return Response({"error": "Project code and comment are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            project = Project.objects.get(project_code=project_code)
        except Project.DoesNotExist:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            phase_type = PhaseType.objects.get(key='FINANCIER_REFUSED')
        except PhaseType.DoesNotExist:
            return Response({"error": "PhaseType 'FINANCIER_REFUSED' not found."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Log refusal as project phase
        ProjectPhase.objects.create(
            project=project,
            phase_type=phase_type,
            performed_by=request.user,
            notify_to=project.create_user,
            comment=comment,
            is_acknowledged=False,
        )

        return Response({"message": "Project refusal logged successfully."},
                        status=status.HTTP_200_OK)
        
        
class TranslationListCreateAPIView(ListCreateAPIView):
    queryset = Translation.objects.all().order_by('-update_time')
    serializer_class = TranslationSerializer
    pagination_class = TranslationsPagination  # reuse or define similar pagination
    filter_backends = [SearchFilter]
    search_fields = ['key']  # 🔍 enables ?search=...
    # permission_classes = [IsAuthenticated,HasCapabilityPermission('CAN_MANAGE_TRANSLATIONS')]
    

    def perform_create(self, serializer):
        serializer.save(translated_by=self.request.user)


class TranslationUpdateAPIView(UpdateAPIView):
    queryset = Translation.objects.all()
    serializer_class = TranslationSerializer
    pagination_class = TranslationsPagination  # reuse or define similar pagination
    # permission_classes = [IsAuthenticated,HasCapabilityPermission('CAN_MANAGE_TRANSLATIONS')]
    lookup_field = 'translation_id'

    def perform_update(self, serializer):
        serializer.save(translated_by=self.request.user)
        
        
        
        
        
#gip confirm views
class GIPProjectListView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    pagination_class = GipConfirmPagination
    permission_classes = [IsAuthenticated, HasCapabilityPermission('CAN_CREATE_TECH_PARTS')]

    def get_queryset(self):
        user = self.request.user  # 👈 Use the logged-in user directly
        gip_confirm = self.request.query_params.get('gip_confirm')
        search = self.request.query_params.get('search', '').strip()

        qs = Project.objects.filter(project_gip=user)

        if gip_confirm == 'true':
            qs = qs.filter(gip_confirm=True)
        elif gip_confirm == 'false':
            qs = qs.filter(gip_confirm=False)

        if search:
            qs = qs.filter(Q(project_name__icontains=search))

        return qs.order_by('-create_date')




class GIPConfirmAPIView(APIView):
    permission_classes = [IsAuthenticated, HasCapabilityPermission('CAN_CREATE_TECH_PARTS')]

    def post(self, request):
        project_code = request.data.get('project_code')
        if not project_code:
            return Response({'error': 'Project code is required.'}, status=400)

        try:
            project = Project.objects.get(project_code=project_code)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=404)

        with transaction.atomic():
            # ✅ Confirm GIP
            project.gip_confirm = True
            project.gip_confirm_date = timezone.now()
            project.save(update_fields=['gip_confirm', 'gip_confirm_date'])

            # ✅ Add phase: GIP_CONFIRMED
            phase_type = PhaseType.objects.get(key='GIP_CONFIRMED')
            ProjectPhase.objects.create(
                project=project,
                phase_type=phase_type,
                performed_by=request.user,
                notify_to=None  # or project.create_user, or whoever should be notified
            )

        return Response({'message': 'GIP confirmed the project and phase updated.'}, status=status.HTTP_200_OK)
    
    
class GipFinancePartsListAPIView(generics.ListAPIView):
    serializer_class = ProjectFinancePartSerializer
    permission_classes = [IsAuthenticated, HasCapabilityPermission('CAN_CREATE_TECH_PARTS')]

    def get_queryset(self):
        project_code = self.kwargs.get('project_code')
        queryset = ProjectFinancePart.objects.filter(project_code=project_code).order_by('fs_part_code')

        send_to_tech_dir = self.request.query_params.get('send_to_tech_dir')
        tech_dir_confirm = self.request.query_params.get('tech_dir_confirm')

        if send_to_tech_dir == 'true':
            queryset = queryset.filter(send_to_tech_dir=True)

        if tech_dir_confirm == 'true':
            queryset = queryset.filter(tech_dir_confirm=True)

        return queryset
    
    
class GipCreateTechnicalPartsView(APIView):
    permission_classes = [IsAuthenticated, HasCapabilityPermission('CAN_CREATE_TECH_PARTS')]

    def post(self, request):
        fs_part_code = request.data.get('fs_part_code')
        parts_data = request.data.get('parts', [])
        try:
            finance_part = ProjectFinancePart.objects.select_related('project_code').get(fs_part_code=fs_part_code)
        except ProjectFinancePart.DoesNotExist:
            return Response({'error': 'Finance part not found.'}, status=404)

        try:
            with transaction.atomic():
                created_parts = []
                for part in parts_data:
                    obj = ProjectGipPart.objects.create(
                        fs_part_code=finance_part,
                        tch_part_no=part['tch_part_no'],
                        tch_part_name=part['tch_part_name'],
                        tch_part_nach=StaffUser.objects.get(pk=part['tch_part_nach']),
                        tch_start_date=part['tch_start_date'],
                        tch_finish_date=part['tch_finish_date'],
                        create_user_id=request.user
                    )
                    created_parts.append(obj)

                phase_type = PhaseType.objects.get(key='GIP_CREATED_TECHNICAL_PARTS')
                ProjectPhase.objects.create(
                    project=finance_part.project_code,
                    phase_type=phase_type,
                    performed_by=request.user
                )

        except Exception as e:
            return Response({'error': f'Failed to create technical parts: {str(e)}'}, status=400)

        return Response({'message': '✅ Technical parts created and phase updated.', 'count': len(created_parts)}, status=status.HTTP_201_CREATED)



class GipUpdateTechnicalPartsView(APIView):
    permission_classes = [IsAuthenticated, HasCapabilityPermission('CAN_CREATE_TECH_PARTS')]

    def post(self, request):
        fs_part_code = request.data.get('fs_part_code')
        parts_data = request.data.get('parts', [])

        print('fs_part_code:', fs_part_code)
        print('parts_data:', parts_data)

        try:
            finance_part = ProjectFinancePart.objects.get(fs_part_code=fs_part_code)
        except ProjectFinancePart.DoesNotExist:
            return Response({'error': 'Finance part not found.'}, status=404)

        fs_start = finance_part.fs_start_date
        fs_finish = finance_part.fs_finish_date

        incoming_codes = set()

        try:
            with transaction.atomic():
                for part in parts_data:
                    start = datetime.strptime(part['tch_start_date'], "%Y-%m-%d").date()
                    end = datetime.strptime(part['tch_finish_date'], "%Y-%m-%d").date()

                    if start < fs_start or end > fs_finish:
                        raise ValidationError(f"❌ Dates for part #{part.get('tch_part_no')} must be between {fs_start} and {fs_finish}")
                    if start > end:
                        raise ValidationError(f"❌ Start date must not be after end date in part #{part.get('tch_part_no')}")

                    part_code = part.get('tch_part_code')
                    if part_code:
                        incoming_codes.add(part_code)
                        try:
                            obj = ProjectGipPart.objects.get(tch_part_code=part_code)
                            obj.tch_part_no = part['tch_part_no']
                            obj.tch_part_name = part['tch_part_name']
                            obj.tch_part_nach_id = part['tch_part_nach']
                            obj.tch_start_date = part['tch_start_date']
                            obj.tch_finish_date = part['tch_finish_date']
                            obj.save()
                        except ProjectGipPart.DoesNotExist:
                            # If somehow code is passed but not found, treat as create
                            ProjectGipPart.objects.create(
                                fs_part_code=finance_part,
                                tch_part_no=part['tch_part_no'],
                                tch_part_name=part['tch_part_name'],
                                tch_part_nach_id=part['tch_part_nach'],
                                tch_start_date=part['tch_start_date'],
                                tch_finish_date=part['tch_finish_date'],
                                create_user_id=request.user
                            )
                    else:
                        # Newly created part (no part_code)
                        new_part = ProjectGipPart.objects.create(
                            fs_part_code=finance_part,
                            tch_part_no=part['tch_part_no'],
                            tch_part_name=part['tch_part_name'],
                            tch_part_nach_id=part['tch_part_nach'],
                            tch_start_date=part['tch_start_date'],
                            tch_finish_date=part['tch_finish_date'],
                            create_user_id=request.user
                        )
                        incoming_codes.add(new_part.tch_part_code)

                # ✅ Delete only parts that were NOT included in update
                ProjectGipPart.objects.filter(
                    fs_part_code=finance_part
                ).exclude(tch_part_code__in=incoming_codes).delete()

        except ValidationError as ve:
            return Response({'error': str(ve)}, status=400)
        except Exception as e:
            return Response({'error': f'❌ Failed to update technical parts: {str(e)}'}, status=400)

        return Response({'message': '✅ Technical parts updated successfully.'}, status=200)




class ProjectGipPartListView(ListAPIView):
    serializer_class = ProjectGipPartSerializer
    permission_classes = [IsAuthenticated, HasCapabilityPermission('CAN_CREATE_WORK_ORDER')]
    pagination_class=ProjectGipPartPagination

    def get_queryset(self):
        return ProjectGipPart.objects.filter(tch_part_nach=self.request.user)
    
    
    
    
class RefuseTechPartView(APIView):
    def get(self, request, tch_part_code):
        part = get_object_or_404(ProjectGipPart, pk=tch_part_code)
        try:
            refusal_phase = PhaseType.objects.get(key='TECH_PART_REFUSED')
            action = ActionLog.objects.filter(
                full_id=part.full_id,
                path_type=part.path_type,
                phase_type=refusal_phase
            ).latest('performed_at')
        except PhaseType.DoesNotExist:
            return Response({'detail': 'Тип этапа TECH_PART_REFUSED не найден.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ActionLog.DoesNotExist:
            return Response({'detail': 'Информация об отказе не найдена.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ActionLogSerializer(action)
        return Response(serializer.data)

    def post(self, request, tch_part_code):
        part = get_object_or_404(ProjectGipPart, pk=tch_part_code)

        comment = request.data.get('comment', '').strip()
        if not comment:
            return Response({'detail': 'Пожалуйста, укажите причину отказа.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refusal_phase = PhaseType.objects.get(key='TECH_PART_REFUSED')
        except PhaseType.DoesNotExist:
            return Response({'detail': 'Тип этапа TECH_PART_REFUSED не найден.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            ActionLog.objects.create(
                full_id=part.full_id,
                path_type=part.path_type,
                phase_type=refusal_phase,
                comment=comment,
                performed_by=request.user,
                notify_to=part.create_user_id,
            )
        except Exception as e:
            return Response({'detail': f'Ошибка при сохранении журнала действий: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'Отказ успешно зафиксирован.'}, status=status.HTTP_201_CREATED)

    def put(self, request, tch_part_code):
        part = get_object_or_404(ProjectGipPart, pk=tch_part_code)

        comment = request.data.get('comment', '').strip()
        if not comment:
            return Response({'detail': 'Пожалуйста, укажите причину отказа.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refusal_phase = PhaseType.objects.get(key='TECH_PART_REFUSED')
        except PhaseType.DoesNotExist:
            return Response({'detail': 'Тип этапа TECH_PART_REFUSED не найден.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            action = ActionLog.objects.filter(
                full_id=part.full_id,
                path_type=part.path_type,
                phase_type=refusal_phase
            ).latest('performed_at')
            action.comment = comment
            action.save()
        except ActionLog.DoesNotExist:
            return Response({'detail': 'Запись отказа не найдена для обновления.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'detail': 'Комментарий к отказу успешно обновлён.'}, status=status.HTTP_200_OK)  
    
    
    
class ConfirmTechPartView(APIView):
    permission_classes = [IsAuthenticated, HasCapabilityPermission('CAN_CREATE_WORK_ORDER')]

    def post(self, request, tch_part_code):
        part = get_object_or_404(ProjectGipPart, pk=tch_part_code)

        if part.nach_otd_confirm:
            return Response({'detail': 'Часть уже подтверждена.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            confirm_phase = PhaseType.objects.get(key='TECH_PART_CONFIRMED')
        except PhaseType.DoesNotExist:
            return Response({'detail': 'Тип этапа TECH_PART_CONFIRMED не найден.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        part.nach_otd_confirm = True
        part.nach_otd_confirm_date = timezone.now()
        part.save()

        try:
            ActionLog.objects.create(
                full_id=part.full_id,
                path_type=part.path_type,
                phase_type=confirm_phase,
                performed_by=request.user,
                notify_to=part.create_user_id,
                comment='Часть подтверждена'
            )
        except Exception as e:
            return Response({'detail': f'Ошибка при сохранении лога: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'Часть успешно подтверждена.'}, status=status.HTTP_200_OK)
    
    
    
class CreateWorkOrderView(APIView):
    permission_classes = [IsAuthenticated,HasCapabilityPermission('CAN_CREATE_WORK_ORDER')]

    @transaction.atomic
    def post(self, request):
        tch_part_code = request.data.get('tch_part_code')
        orders = request.data.get('orders', [])

        if not tch_part_code or not orders:
            return Response({'detail': 'Отсутствует техническая часть или список заданий'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tech_part = ProjectGipPart.objects.select_related('fs_part_code__project_code').get(pk=tch_part_code)
        except ProjectGipPart.DoesNotExist:
            return Response({'detail': 'Техническая часть не найдена'}, status=status.HTTP_404_NOT_FOUND)

        try:
            phase_type = PhaseType.objects.get(key='WORK_ORDER_CREATED')
        except PhaseType.DoesNotExist:
            phase_type = None

        for order_data in orders:
            serializer = WorkOrderCreateSerializer(data=order_data)
            serializer.is_valid(raise_exception=True)

            work_order = serializer.save(
                tch_part_code=tech_part,
                create_user=request.user
            )

            # ➕ Create ActionLog
            ActionLog.objects.create(
                full_id=work_order.full_id,
                path_type=work_order.path_type,
                phase_type=phase_type,
                performed_by=request.user,
                notify_to=work_order.wo_staff,  # 👈 Notify the assigned staff
                comment=f"Наряд №{work_order.wo_no} создан"
            )


        return Response({'detail': '✅ Наряды успешно созданы'}, status=status.HTTP_201_CREATED)
    
    

class LoadWorkOrdersByPartView(APIView):
    permission_classes = [IsAuthenticated,HasCapabilityPermission('CAN_CREATE_WORK_ORDER')]

    def get(self, request, tch_part_code):
        orders = WorkOrder.objects.filter(tch_part_code=tch_part_code).order_by('wo_no')
        serializer = WorkOrderSerializer(orders, many=True)
        return Response(serializer.data)


    
    
    
class UpdateWorkOrdersView(APIView):
    permission_classes = [IsAuthenticated, HasCapabilityPermission('CAN_CREATE_WORK_ORDER')]

    def put(self, request):
        data = request.data
        tch_part_code = data.get('tch_part_code')
        orders = data.get('orders', [])

        if not tch_part_code or not isinstance(orders, list):
            return Response({'detail': 'Invalid input.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            part = ProjectGipPart.objects.get(tch_part_code=tch_part_code)
        except ProjectGipPart.DoesNotExist:
            return Response({'detail': 'Part not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            phase_type = PhaseType.objects.get(key='WORK_ORDER_UPDATED')
        except PhaseType.DoesNotExist:
            phase_type = None

        with transaction.atomic():
            # Get all existing orders for the part
            existing_wos = WorkOrder.objects.filter(tch_part_code=part)
            existing_map = {wo.pk: wo for wo in existing_wos}
            incoming_ids = {o.get('wo_id') for o in orders if o.get('wo_id')}
            print('incoming_ids',incoming_ids)

            # Process updates and creates
            for o in orders:
                wo_id = o.get('wo_id')

                if wo_id and wo_id in existing_map:
                    # Update existing
                    wo = existing_map[wo_id]
                    wo.wo_no = o['wo_no']
                    wo.wo_name = o['wo_name']
                    wo.wo_start_date = o['wo_start_date']
                    wo.wo_finish_date = o['wo_finish_date']
                    wo.wo_staff_id = o['wo_staff']
                    wo.save()
                else:
                    # Create new
                    wo = WorkOrder.objects.create(
                        tch_part_code=part,
                        wo_no=o['wo_no'],
                        wo_name=o['wo_name'],
                        wo_start_date=o['wo_start_date'],
                        wo_finish_date=o['wo_finish_date'],
                        wo_staff_id=o['wo_staff'],
                        create_user_id=request.user.user_id,
                    )

                # Action log
                ActionLog.objects.create(
                    full_id=wo.full_id,
                    path_type=wo.path_type,
                    phase_type=phase_type,
                    performed_by=request.user,
                    notify_to=wo.wo_staff,
                    comment=f"Наряд №{wo.wo_no} обновлен или создан"
                )

            # Delete those not in incoming
            to_delete = [wo for wo_id, wo in existing_map.items() if wo_id not in incoming_ids]
            for wo in to_delete:
                wo.delete()

        return Response({'detail': 'Work orders updated successfully'}, status=status.HTTP_200_OK)






class CompleteWorkOrderListAPIView(ListAPIView):
    serializer_class = CompleteWorkOrderSerializer
    permission_classes = [IsAuthenticated,HasCapabilityPermission('CAN_COMPLETE_WORK_ORDER')]
    pagination_class = CompleteWorkOrderPagination

    def get_queryset(self):
        return WorkOrder.objects.filter(wo_staff=self.request.user).order_by('-wo_start_date')
    
    
    
class RefuseWorkOrderView(APIView):
    permission_classes = [IsAuthenticated, HasCapabilityPermission('CAN_COMPLETE_WORK_ORDER')]
    
    
    def get(self, request, wo_id):
        work_order = get_object_or_404(WorkOrder, pk=wo_id)
        try:
            refusal_phase = PhaseType.objects.get(key='WORK_ORDER_REFUSED')
            action = ActionLog.objects.filter(
                full_id=work_order.full_id,
                path_type=work_order.path_type,
                phase_type=refusal_phase
            ).latest('performed_at')
            print('action:',action)
        except PhaseType.DoesNotExist:
            return Response({'detail': 'Тип этапа WORK_ORDER_REFUSED не найден.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ActionLog.DoesNotExist:
            return Response({'detail': 'Информация об отказе не найдена.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ActionLogSerializer(action)
        return Response(serializer.data)

    def post(self, request, wo_id):
        work_order = get_object_or_404(WorkOrder, pk=wo_id)
        comment = request.data.get('comment', '').strip()
        if not comment:
            return Response({'detail': 'Пожалуйста, укажите причину отказа.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refusal_phase = PhaseType.objects.get(key='WORK_ORDER_REFUSED')
            ActionLog.objects.create(
                full_id=work_order.full_id,
                path_type=work_order.path_type,
                phase_type=refusal_phase,
                comment=comment,
                performed_by=request.user,
                notify_to=work_order.create_user,
            )
        except Exception as e:
            return Response({'detail': f'Ошибка при сохранении журнала действий: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'Отказ успешно зафиксирован.'}, status=status.HTTP_201_CREATED)

    def put(self, request, wo_id):
        work_order = get_object_or_404(WorkOrder, pk=wo_id)
        comment = request.data.get('comment', '').strip()
        if not comment:
            return Response({'detail': 'Пожалуйста, укажите причину отказа.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refusal_phase = PhaseType.objects.get(key='WORK_ORDER_REFUSED')
            action = ActionLog.objects.filter(
                full_id=work_order.full_id,
                path_type=work_order.path_type,
                phase_type=refusal_phase
            ).latest('performed_at')
            action.comment = comment
            action.save()
        except ActionLog.DoesNotExist:
            return Response({'detail': 'Запись отказа не найдена для обновления.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'detail': 'Комментарий к отказу успешно обновлён.'}, status=status.HTTP_200_OK)
    
    
    
    


class WorkOrderConfirmView(APIView):
    permission_classes = [IsAuthenticated, HasCapabilityPermission('CAN_COMPLETE_WORK_ORDER')]

    def post(self, request, wo_id):
        order = get_object_or_404(WorkOrder, pk=wo_id)

        if order.staff_confirm:
            return Response({'detail': 'Рабочий наряд уже подтвержден.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            confirm_phase = PhaseType.objects.get(key='WORK_ORDER_CONFIRMED')
        except PhaseType.DoesNotExist:
            return Response({'detail': 'Тип этапа WORK_ORDER_CONFIRMED не найден.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        order.staff_confirm = True
        order.save()

        try:
            ActionLog.objects.create(
                full_id=order.full_id,
                path_type=order.path_type,
                phase_type=confirm_phase,
                performed_by=request.user,
                notify_to=order.create_user,
                comment='Рабочий наряд подтвержден'
            )
        except Exception as e:
            return Response({'detail': f'Ошибка при сохранении лога: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'Рабочий наряд успешно подтвержден.'}, status=status.HTTP_200_OK)
    
    
    
class CompleteOrUpdateWorkOrderView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, wo_id):
        work_order = get_object_or_404(WorkOrder, pk=wo_id)

        wo_answer = request.data.get('wo_answer', '').strip()
        wo_remark = request.data.get('wo_remark', '').strip()
        print('wo_answer',wo_answer)
        print('wo_remark',wo_remark)

        if not wo_answer:
            return Response({'error': 'Answer is required'}, status=status.HTTP_400_BAD_REQUEST)

        work_order.wo_answer = wo_answer
        work_order.wo_remark = wo_remark
        work_order.answer_date = timezone.now()
        work_order.staff_confirm = True
        work_order.save()

        # Save uploaded files
        for file in request.FILES.getlist('files'):
            WorkOrderFile.objects.create(work_order=work_order, file=file)

        # Log action
        full_id = work_order.full_id
        path_type = work_order.path_type
        phase_type = PhaseType.objects.filter(key='WORK_ORDER_COMPLETED').first()


        ActionLog.objects.create(
            full_id=full_id,
            path_type=path_type,
            phase_type=phase_type,
            comment=wo_remark,
            performed_by=request.user,
            notify_to=work_order.create_user  # ✅ Notify the work order's creator
        )

        return Response({'success': True}, status=status.HTTP_200_OK)

