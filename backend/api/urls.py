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
                    TranslationListView,
                    DepartmentListCreateView,
                    DepartmentUpdateView,
                    RefuseProjectByFinancierView,
                    TranslationListCreateAPIView,
                    TranslationUpdateAPIView,
                    TechDirRefuseAPIView,
                    TechDirVerifyAPIView,
                    GIPProjectListView, 
                    GIPConfirmAPIView,
                    GipFinancePartsListAPIView,
                    GipCreateTechnicalPartsView,
                    GipUpdateTechnicalPartsView)
                    

urlpatterns = [
    path('login/', StaffUserLoginView.as_view(), name='jwt_login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('create-project/', ProjectCreateAPIView.as_view(), name='create-project'),\
    
    #take users with capability     
    path('users-with-capability/', UsersWithCapabilityAPIView.as_view(), name='users-with-capability'),
    
    path('projects-notifications/financier/', ProjectListNotificationFinancierView.as_view(), name='project-notifications-financier'),
    path('projects-confirm/financier/', ProjectListFinancierConfirmView.as_view(), name='project-notifications-financier'),
    path('projects-confirm/financier/refuse/', RefuseProjectByFinancierView.as_view()),
    path('projects-confirm/financier/confirm/', ConfirmProjectByFinancierView.as_view(), name='confirm-project-financier'),
    path('projects-financial-parts/create/', CreateFinancialPartsView.as_view(), name='create-financial-parts'),
    path('projects/', ProjectListAPIView.as_view(), name='project-list'),
    
    #financepartupdate
    path('projects-financial-parts/<int:project_code>/', ProjectFinancePartsListAPIView.as_view()),
    path('projects-financial-parts/<int:project_code>/update/', ProjectFinancePartsUpdateAPIView.as_view()),
    path('projects-financial-parts/<int:project_code>/send-to-tech-dir/', SendToTechDirAPIView.as_view()),
    
    #tech dir
    path('projects-confirm/tech-dir/', ProjectListTechDirConfirmView.as_view(), name='projects-confirm-tech-dir'),
    path('projects/tech-dir/refuse/', TechDirRefuseAPIView.as_view()),
    path('projects/tech-dir/verify/', TechDirVerifyAPIView.as_view()),
    
    #organisationadd
    path('partners/', PartnerListCreateView.as_view(), name='partner-list-create'),
    path('partners/<int:partner_code>/update/', PartnerUpdateView.as_view(), name='partner-update'),
    
    #translations
    path('translations/', TranslationListView.as_view(), name='translation-list'),
    
    #departments
    path('departments/', DepartmentListCreateView.as_view(), name='department-list-create'),
    path('departments/<int:department_id>/update/', DepartmentUpdateView.as_view(), name='department-update'),
    
    #manage-translations
    path('manage-translations/', TranslationListCreateAPIView.as_view(), name='translation-list-create'),
    path('manage-translations/<int:translation_id>/update/', TranslationUpdateAPIView.as_view()),
    
    #for gip confirm
    path('gip-projects/', GIPProjectListView.as_view(), name='gip-projects'),
    path('gip-projects/confirm-gip/', GIPConfirmAPIView.as_view(), name='gip-confirm'),
    path('gip-projects/fn-parts/<int:project_code>/', GipFinancePartsListAPIView.as_view()),
    path('gip-projects/create-technical-parts/', GipCreateTechnicalPartsView.as_view(), name='create-tecnical-parts'),
    path('gip-projects/update-technical-parts/', GipUpdateTechnicalPartsView.as_view(), name='update-technical-parts'),

]
