from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (StaffUserLoginView,
                    ProjectCreateAPIView,
                    ProjectListCreateView,
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
                    GipUpdateTechnicalPartsView,
                    ProjectRetrieveUpdateView,
                    ProjectGipPartListView,
                    RefuseTechPartView,
                    ConfirmTechPartView,
                    CreateWorkOrderView,
                    UpdateWorkOrdersView,
                    LoadWorkOrdersByPartView,
                    CompleteWorkOrderListAPIView,
                    RefuseWorkOrderView,
                    WorkOrderConfirmView,
                    CompleteOrUpdateWorkOrderView,
                    MyNotificationLogsView,
                    MarkActionLogIdentifiedView,
                    NotificationCountView)
          
          
          
from .special_views import SpecialProjectRetrieveView,SendMessageView, MessageListView          

urlpatterns = [
    path('login/', StaffUserLoginView.as_view(), name='jwt_login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('create-project/', ProjectCreateAPIView.as_view(), name='create-project'),\
    
    #project-create
    path('project-list-create/', ProjectListCreateView.as_view(), name='project-list-create'),
    path('project-list-create/<str:project_code>/', ProjectRetrieveUpdateView.as_view(), name='project-update'),
    
    
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


    #work-order-create-screen
    path('work-order/tech-parts/', ProjectGipPartListView.as_view(), name='create-work-order'),
    path('work-order/tech-parts/<int:tch_part_code>/',RefuseTechPartView.as_view(),name='refuse_tech_part'),
    path('work-order/tech-parts/<int:tch_part_code>/confirm/', ConfirmTechPartView.as_view(), name='confirm_tech_part'),
     path('work-order/by-part/<int:tch_part_code>/', LoadWorkOrdersByPartView.as_view(), name='load_work_orders_by_part'),
    path('work-order/create/', CreateWorkOrderView.as_view(), name='create_work_order'),
    path('work-order/update/', UpdateWorkOrdersView.as_view(), name='update_work_orders'),
    
    #complete-work-order
    path('complete-work-order/my-tasks/', CompleteWorkOrderListAPIView.as_view(), name='complete_work_order_list'),
    path('complete-work-order/<int:wo_id>/', RefuseWorkOrderView.as_view(), name='completeworkorder_refuse'),
    path('complete-work-order/<int:wo_id>/confirm/', WorkOrderConfirmView.as_view(), name='confirm_work_order'),
    path('complete-work-order/complete/<int:wo_id>/', CompleteOrUpdateWorkOrderView.as_view(), name='complete_work_order'),
    
    
    #special
    path('projects/special/<int:project_code>/', SpecialProjectRetrieveView.as_view(), name='special_project_detail'),
    
    #messages
    path('messages/send/', SendMessageView.as_view(), name='send_message'),
    path('messages/', MessageListView.as_view(), name='list_messages'),
    
    
    
    #notifications
    path('action-logs/my-notifications/', MyNotificationLogsView.as_view(), name='my_action_notifications'),
    path('action-logs/<int:action_id>/mark-identified/', MarkActionLogIdentifiedView.as_view(), name='mark_action_identified'),
    path('action-logs/unread-count/', NotificationCountView.as_view(), name='notification-count'),
]
