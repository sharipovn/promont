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
                    ParentDepartmentListView,
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
                    NotificationCountView,
                    ProjectPhaseProgressView,
                    FinishedWorkOrderListView,
                    ConfirmFinishedWorkOrderView,
                    UnlockFinishedWorkOrderView,
                    RefuseFinishedWorkOrderView,
                    StaffManagementUsersListView,
                    StaffMgDepartmentListAPIView,
                    StaffUserUpdateAPIView,
                    ToggleVacationAPIView,
                    ToggleMedicalLeaveAPIView,
                    JobPositionsByDepartmentView,
                    JobPositionCreateView,
                    JobPositionDeleteView,
                    JobPositionUpdateView,
                    MyDepartmentsTreeView,
                    StaffByDepartmentView,
                    ChatMessageListView,
                    ChatMessageSendView,
                    MarkChatMessagesReadView,
                    UserTaskCreateView,
                    UserTaskListView,
                    MarkTaskAsDoneView,
                    ChatMessageSendFileView,
                    UnreadMessagesMinimalView,
                    CurrencyListView,
                    ToggleBusinessTripPIView,
                    HoldStaffUserListView,
                    HoldWorkOrderView,
                    ChangePasswordView)
          
          
          
from .special_views import SpecialProjectRetrieveView,SendMessageView, MessageListView      
from .admin_views import AdminUserListView,CreateUserView,AdminRoleListView,AdminUpdateUserView,AdminSetUserPasswordView,PauseUserView,ActivateUserView,ProjectLogListView,ProjectSnapshotView,AdminUserDeleteView,UserSnapshotView,UserLogListView

urlpatterns = [
    path('login/', StaffUserLoginView.as_view(), name='jwt_login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('create-project/', ProjectCreateAPIView.as_view(), name='create-project'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    
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
    path('parent-departments/', ParentDepartmentListView.as_view(), name='parent-department-list'),
    path('departments/<int:department_id>/update/', DepartmentUpdateView.as_view(), name='department-update'),
    path('job-positions/department/<int:department_id>/', JobPositionsByDepartmentView.as_view(), name='job_positions_by_department'),
    path('job-positions/', JobPositionCreateView.as_view(), name='job_position_create'),
     path('job-positions/<int:position_id>/', JobPositionDeleteView.as_view(), name='delete_position'),
     path('job-positions/update/<int:position_id>/', JobPositionUpdateView.as_view(), name='update_job_position'),
    
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
    path('hold-work-order/<int:wo_id>/', HoldWorkOrderView.as_view(), name='hold-work-order'),
    path('hold-work-order/staff-users/', HoldStaffUserListView.as_view(), name='hold-work-order-staff-users'),
    
    
    #special
    path('projects/special/<int:project_code>/', SpecialProjectRetrieveView.as_view(), name='special_project_detail'),
    
    #messages
    path('messages/send/', SendMessageView.as_view(), name='send_message'),
    path('messages/', MessageListView.as_view(), name='list_messages'),
    
    
    
    #notifications
    path('action-logs/my-notifications/', MyNotificationLogsView.as_view(), name='my_action_notifications'),
    path('action-logs/<int:action_id>/mark-identified/', MarkActionLogIdentifiedView.as_view(), name='mark_action_identified'),
    path('action-logs/unread-count/', NotificationCountView.as_view(), name='notification-count'),
    
    #phase progress
    path('projects/<int:project_code>/phase-progress/', ProjectPhaseProgressView.as_view()),
    
    #for nach otdel confirm finisged jobs
    path('work-order/finished-for-confirm/', FinishedWorkOrderListView.as_view()),
    path('work-order/<int:wo_id>/confirm-finished-work-order/', ConfirmFinishedWorkOrderView.as_view()),
    path('work-order/<int:wo_id>/unlock-finished-work-order/', UnlockFinishedWorkOrderView.as_view()),
    path('work-order/<int:wo_id>/refuse-finished-work-order/', RefuseFinishedWorkOrderView.as_view()),
    
    
    
    #forstaffmanagement
    path('manage-staff/staff-users/', StaffManagementUsersListView.as_view(), name='staff-users-list'),
    path('manage-staff/department-list/', StaffMgDepartmentListAPIView.as_view(), name='staff-department-list'),
    path('manage-staff/staff-users/<int:user_id>/', StaffUserUpdateAPIView.as_view(), name='update_staff_user'),
    path('manage-staff/staff-users/<int:user_id>/toggle-vacation/', ToggleVacationAPIView.as_view(), name='toggle_vacation'),
    path('manage-staff/staff-users/<int:user_id>/toggle-medical-leave/', ToggleMedicalLeaveAPIView.as_view(), name='toggle_medical_leave'),
    path('manage-staff/staff-users/<int:user_id>/toggle-bisness-trip/', ToggleBusinessTripPIView.as_view(), name='toggle_vacation'),
    
    
    
    
    #task management
    path('my-departments/tree/', MyDepartmentsTreeView.as_view(), name='my_departments_tree'),
    path('staff/by-department/<int:department_id>/', StaffByDepartmentView.as_view(), name='staff_by_department'),
    path('chat/messages/task/<int:task_id>/', ChatMessageListView.as_view()),
    path('chat/messages/send/', ChatMessageSendView.as_view(), name='chat-messages-by-task'),
    path('chat/messages/task/<int:task_id>/mark-read/', MarkChatMessagesReadView.as_view(), name='chat-mark-read-by-task'),
    path('user-tasks/create/', UserTaskCreateView.as_view(), name='create-user-task'),
    path('user-tasks/list/', UserTaskListView.as_view(), name='user-task-list'),
    path('user-tasks/mark-done/<int:task_id>/', MarkTaskAsDoneView.as_view(), name='mark-task-done'),
    path('chat/messages/send-files/', ChatMessageSendFileView.as_view()),
    path('chat/messages/unread-minimal/', UnreadMessagesMinimalView.as_view(), name='unread-messages-minimal'),


    #currency
    path('currencies/', CurrencyListView.as_view(), name='currency-list'),
    
    #admin-panel
    path('admin-users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin-users/create/', CreateUserView.as_view(), name='create-user'),
    path('admin-users/roles/', AdminRoleListView.as_view(), name='admin-role-list'),
    path('admin-users/update/<int:user_id>/', AdminUpdateUserView.as_view()),
    path('admin-users/set-password/<int:user_id>/', AdminSetUserPasswordView.as_view()),
    path('admin-users/pause/<int:user_id>/', PauseUserView.as_view()),
    path('admin-users/activate/<int:user_id>/', ActivateUserView.as_view()),
    path('admin-users/delete/<int:user_id>/', AdminUserDeleteView.as_view(), name='delete-user'),
    
    #admin panel logs
    path('admin-panel/project-logs/', ProjectLogListView.as_view(), name='project-logs'),
    path('admin-panel/project-snapshot/<int:history_id>/', ProjectSnapshotView.as_view()),
    
    path('admin-panel/user-logs/', UserLogListView.as_view()),
    path('admin-panel/user-snapshot/<int:history_id>/', UserSnapshotView.as_view()),
]
