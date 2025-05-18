# api/views.py

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from django.contrib.auth import authenticate
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .permissions import HasCapabilityPermission

from api.models import StaffUser,Project
from .serializers import ProjectSerializer,StaffUserSimpleSerializer
from api.serializers import StaffUserTokenSerializer
from django.utils.dateparse import parse_date
from django.db.models import Q
from .pagination import ProjectsPagination,ProjectsFiancierConfirmPagination



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
        qs=Project.objects.filter(financier=user)
        if financier_confirmed == 'true':
            qs = qs.filter(financier_confirm=True)
        return qs.order_by('-create_date')
    
    
    
    

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




