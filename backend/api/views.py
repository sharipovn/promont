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
from rest_framework.filters import SearchFilter, OrderingFilter




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





#for notifications for prject
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
        
        
        
        


