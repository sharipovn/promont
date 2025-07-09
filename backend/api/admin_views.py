# views.py
from rest_framework.views import APIView
from django.db.models import Q
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated
from .models import StaffUser,Role,Project          
from .admin_serializers import AdminUserListSerializer,StaffUserCreateSerializer,AdminRoleSerializer,AdminUserUpdateSerializer,AdminSetPasswordSerializer,ProjectLogSerializer,ProjectSnapshotSerializer,UserLogSerializer,UserSnapshotSerializer
from .permissions import HasCapabilityPermission
from .pagination import AdminUserPagination,ProjectLogPagination
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date


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
    
    
    
class AdminUserDeleteView(APIView):
    permission_classes = [IsAuthenticated, HasCapabilityPermission('IS_ADMIN')]
    def delete(self, request, user_id):
        try:
            user = StaffUser.objects.get(user_id=user_id)
        except StaffUser.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        # Optionally prevent deleting superusers or yourself
        if user.is_superuser:
            return Response({"detail": "Cannot delete a superuser."}, status=status.HTTP_403_FORBIDDEN)
        if user == request.user:
            return Response({"detail": "You cannot delete your own account."}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response({"detail": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT) 
    
    
class ProjectLogListView(ListAPIView):
    serializer_class = ProjectLogSerializer
    permission_classes = [IsAuthenticated, HasCapabilityPermission('IS_ADMIN')]
    pagination_class = ProjectLogPagination  # ✅ Use pagination

    def get_queryset(self):
        queryset = Project.history.all().order_by('-history_date')  # ✅ Uses HistoricalProject

        project_id = self.request.query_params.get('project_id')
        project_name = self.request.query_params.get('project_name')
        user_name = self.request.query_params.get('user_name')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        # ✅ Filters — Defensive against empty strings
        if project_id:
            queryset = queryset.filter(project_code=project_id)

        if project_name:
            queryset = queryset.filter(project_name__icontains=project_name)

        if user_name:
            queryset = queryset.filter(history_user_display__icontains=user_name)

        if start_date:
            queryset = queryset.filter(history_date__date__gte=parse_date(start_date))

        if end_date:
            queryset = queryset.filter(history_date__date__lte=parse_date(end_date))

        return queryset




class ProjectSnapshotView(APIView):
    permission_classes = [IsAuthenticated, HasCapabilityPermission('IS_ADMIN')]

    def get(self, request, history_id):
        try:
            record = Project.history.get(history_id=history_id)
            serializer = ProjectSnapshotSerializer(record)
            return Response(serializer.data)
        except Project.history.model.DoesNotExist:
            return Response({'detail': 'Snapshot not found'}, status=404)
        
        
        
class UserLogListView(ListAPIView):
    serializer_class = UserLogSerializer
    permission_classes = [IsAuthenticated, HasCapabilityPermission('IS_ADMIN')]
    pagination_class = ProjectLogPagination

    def get_queryset(self):
        queryset = StaffUser.history.all().order_by('-history_date')

        username = self.request.query_params.get('username')
        fio = self.request.query_params.get('fio')
        changed_by = self.request.query_params.get('user_name')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if username:
            queryset = queryset.filter(username__icontains=username)
        if fio:
            queryset = queryset.filter(fio__icontains=fio)
        if changed_by:
            queryset = queryset.filter(history_user_display__icontains=changed_by)
        if start_date:
            queryset = queryset.filter(history_date__date__gte=parse_date(start_date))
        if end_date:
            queryset = queryset.filter(history_date__date__lte=parse_date(end_date))

        return queryset
    
    
class UserSnapshotView(APIView):
    permission_classes = [IsAuthenticated, HasCapabilityPermission('IS_ADMIN')]

    def get(self, request, history_id):
        try:
            record = StaffUser.history.get(history_id=history_id)
            serializer = UserSnapshotSerializer(record)
            return Response(serializer.data)
        except StaffUser.history.model.DoesNotExist:
            return Response({'detail': 'Snapshot not found'}, status=404)