from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import StaffUserLoginView

urlpatterns = [
    path('login/', StaffUserLoginView.as_view(), name='jwt_login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
