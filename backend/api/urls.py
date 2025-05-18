from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (StaffUserLoginView,
                    ProjectCreateAPIView,
                    UsersWithCapabilityAPIView,
                    ProjectListNotificationFinancierView,
                    ProjectListAPIView,
                    ProjectListFinancierConfirmView,
                    ConfirmProjectByFinancierView)

urlpatterns = [
    path('login/', StaffUserLoginView.as_view(), name='jwt_login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('create-project/', ProjectCreateAPIView.as_view(), name='create-project'),
    path('users-with-capability/', UsersWithCapabilityAPIView.as_view(), name='users-with-capability'),
    path('projects-notifications/financier/', ProjectListNotificationFinancierView.as_view(), name='project-notifications-financier'),
    path('projects-confirm/financier/', ProjectListFinancierConfirmView.as_view(), name='project-notifications-financier'),
    path('projects-confirm/financier/confirm/', ConfirmProjectByFinancierView.as_view(), name='confirm-project-financier'),
    path('projects/', ProjectListAPIView.as_view(), name='project-list'),
    
]
