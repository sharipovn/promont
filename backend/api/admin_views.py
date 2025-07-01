# views.py
from rest_framework.views import APIView
from django.db.models import Q
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated
from .models import StaffUser,Role
from .admin_serializers import AdminUserListSerializer,StaffUserCreateSerializer,AdminRoleSerializer,AdminUserUpdateSerializer,AdminSetPasswordSerializer
from .permissions import HasCapabilityPermission
from .pagination import AdminUserPagination
from django.shortcuts import get_object_or_404


class AdminUserListView(ListAPIView):
    serializer_class = AdminUserListSerializer
    pagination_class = AdminUserPagination
    permission_classes = [
        IsAuthenticated,
        HasCapabilityPermission('IS_ADMIN'),
    ]

    def get_queryset(self):
        search = self.request.query_params.get('search', '').strip()
        qs = StaffUser.objects.all().order_by('-update_time')
        if search:
            qs = qs.filter(
                Q(fio__icontains=search) | Q(username__icontains=search)
            )
        return qs
    
    
    
    
class CreateUserView(APIView):
    permission_classes = [
        IsAuthenticated,
        HasCapabilityPermission('IS_ADMIN'),
    ]

    def post(self, request):
        serializer = StaffUserCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(create_user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # ✅ Print validation errors for debugging
        print("Validation errors:", serializer.errors)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class AdminUpdateUserView(APIView):
    permission_classes = [
        IsAuthenticated,
        HasCapabilityPermission('IS_ADMIN'),
    ]

    def put(self, request, user_id):
        user = get_object_or_404(StaffUser, user_id=user_id)
        serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            print('serializer:',serializer)
            serializer.save(update_time=now())
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)     
    
    
    

class AdminSetUserPasswordView(APIView):
    permission_classes = [
        IsAuthenticated,
        HasCapabilityPermission('IS_ADMIN'),
    ]

    def post(self, request, user_id):
        try:
            user = StaffUser.objects.get(pk=user_id)
        except StaffUser.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminSetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response({"detail": "Password set successfully."}, status=status.HTTP_200_OK)
        print('serializer.errors:',serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        
        
        
        
class AdminRoleListView(ListAPIView):
    queryset = Role.objects.all()
    serializer_class = AdminRoleSerializer
    permission_classes = [IsAuthenticated]
    
    
    
class PauseUserView(APIView):
    permission_classes = [IsAuthenticated, HasCapabilityPermission('IS_ADMIN')]

    def post(self, request, user_id):
        try:
            user = StaffUser.objects.get(pk=user_id)
        except StaffUser.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user.is_superuser:
            return Response({'detail': 'Cannot pause a superuser.'}, status=status.HTTP_403_FORBIDDEN)

        user.is_active = False
        user.save()
        return Response({'detail': 'User paused successfully.'}, status=status.HTTP_200_OK)


class ActivateUserView(APIView):
    permission_classes = [IsAuthenticated, HasCapabilityPermission('IS_ADMIN')]

    def post(self, request, user_id):
        try:
            user = StaffUser.objects.get(pk=user_id)
        except StaffUser.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user.is_superuser:
            return Response({'detail': 'Cannot activate a superuser.'}, status=status.HTTP_403_FORBIDDEN)

        user.is_active = True
        user.save()
        return Response({'detail': 'User activated successfully.'}, status=status.HTTP_200_OK)