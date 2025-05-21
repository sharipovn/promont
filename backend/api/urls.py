from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (StaffUserLoginView,
                    ProjectCreateAPIView,
                    UsersWithCapabilityAPIView,
                    ProjectListNotificationFinancierView,
                    ProjectListAPIView,
                    ProjectListFinancierConfirmView,
                    ConfirmProjectByFinancierView,
                    CreateFinancialPartsView,
                    ProjectFinancePartsListAPIView,
                    ProjectFinancePartsUpdateAPIView,
                    SendToTechDirAPIView,
                    ProjectListTechDirConfirmView,
                    PartnerListCreateView,
                    PartnerUpdateView,
                    TranslationListView)
                    

urlpatterns = [
    path('login/', StaffUserLoginView.as_view(), name='jwt_login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('create-project/', ProjectCreateAPIView.as_view(), name='create-project'),
    path('users-with-capability/', UsersWithCapabilityAPIView.as_view(), name='users-with-capability'),
    path('projects-notifications/financier/', ProjectListNotificationFinancierView.as_view(), name='project-notifications-financier'),
    path('projects-confirm/financier/', ProjectListFinancierConfirmView.as_view(), name='project-notifications-financier'),
    path('projects-confirm/financier/confirm/', ConfirmProjectByFinancierView.as_view(), name='confirm-project-financier'),
    path('projects-financial-parts/create/', CreateFinancialPartsView.as_view(), name='create-financial-parts'),
    path('projects/', ProjectListAPIView.as_view(), name='project-list'),
    
    #financepartupdate
    path('projects-financial-parts/<int:project_code>/', ProjectFinancePartsListAPIView.as_view()),
    path('projects-financial-parts/<int:project_code>/update/', ProjectFinancePartsUpdateAPIView.as_view()),
    path('projects-financial-parts/<int:project_code>/send-to-tech-dir/', SendToTechDirAPIView.as_view()),
    path('projects-confirm/tech-dir/', ProjectListTechDirConfirmView.as_view(), name='projects-confirm-tech-dir'),
    
    #organisationadd
    path('partners/', PartnerListCreateView.as_view(), name='partner-list-create'),
    path('partners/<int:partner_code>/update/', PartnerUpdateView.as_view(), name='partner-update'),
    
    #translations
    path('translations/', TranslationListView.as_view(), name='translation-list'),
    
]
