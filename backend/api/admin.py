from django.contrib import admin
from .models import (Capability, 
                     Department,
                     StaffUser,
                     Role,
                     Project,
                     ProjectFinancePart,
                     Partner,
                     Translation,
                     PhaseType,
                     ProjectPhase,
                     ProjectGipPart,
                     WorkOrder, 
                     WorkOrderFile,
                     ActionLog,
                     ObjectLastStatus,
                     Message,
                     JobPosition,
                     ChatMessage,
                     ChatMessageFile,
                     UserTask)
from django.contrib.auth.admin import UserAdmin


@admin.register(Capability)
class CapabilityAdmin(admin.ModelAdmin):
    list_display = ('capability_id', 'capability_name', 'description', 'create_time','update_time')
    search_fields = ('capability_name',)
    list_filter = ('create_time',)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('department_id', 'department_name', 'parent', 'create_time', 'update_time')
    search_fields = ('department_name',)
    list_filter = ('parent',)

@admin.register(JobPosition)
class JobPositionAdmin(admin.ModelAdmin):
    list_display = ('position_name', 'department', 'create_time', 'update_time')
    search_fields = ('position_name',)
    list_filter = ('department',)

@admin.register(StaffUser)
class StaffUserAdmin(UserAdmin):
    model = StaffUser
    list_display = (
        'user_id', 'username', 'fio','position__position_name', 'phone_number',  # ✅ added phone_number
        'is_staff', 'is_active', 'last_login', 'create_time',
        'department', 'role', 'on_vocation'  # ✅ added on_vocation status
    )
    search_fields = ('username', 'fio', 'phone_number')  # ✅ added phone_number to search
    ordering = ('user_id',)

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {
            'fields': (
                'fio', 'position', 'department', 'role', 'phone_number', 'pnfl',
                'birthday', 'address', 'profile_image', 'position_start_date'  # ✅ personal additions
            )
        }),
        ('Vacation Info', {
            'fields': (
                'on_vocation', 'on_vocation_start', 'on_vocation_end'
            )
        }),
        ('Login Info', {'fields': ('last_login', 'last_login_time_fail')}),
        ('Permissions', {
            'fields': (
                'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'
            )
        }),
        ('Timestamps', {'fields': ('create_time',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'fio', 'position', 'department', 'role',
                'phone_number', 'password1', 'password2',
                'is_staff', 'is_active'
            )
        }),
    )

    
@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('role_id', 'role_name', 'created_by', 'create_time', 'update_time')
    readonly_fields = ('created_by', 'create_time', 'update_time')

    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)




@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        'project_code', 'project_name', 'total_price','partner',
        'start_date', 'end_date',
        'financier', 'financier_confirm', 'financier_confirm_date',
        'project_gip', 'gip_confirm', 'gip_confirm_date',
        'create_user', 'create_date', 'update_date',
        'get_full_id', 'last_status_display',
    )
    list_filter = ('financier_confirm', 'gip_confirm', 'start_date', 'end_date', 'partner')
    search_fields = ('project_code', 'project_name','partner__partner_name')

    @admin.display(description='Full ID')
    def get_full_id(self, obj):
        return obj.full_id or None

    @admin.display(description='Last Action')
    def last_status_display(self, obj):
        try:
            status = ObjectLastStatus.objects.get(full_id=obj.full_id)
            return status.latest_action or None
        except ObjectLastStatus.DoesNotExist:
            return None

    

@admin.register(ProjectFinancePart)
class ProjectFinancePartAdmin(admin.ModelAdmin):
    list_display = (
        'fs_part_code', 'fs_part_no', 'fs_part_name', 'fs_part_price',
        'fs_start_date', 'fs_finish_date',
        'project_code',
        'create_user_id', 'create_date',
        'send_to_tech_dir', 'send_to_tech_dir_date',
        'tech_dir_confirm', 'tech_dir_confirm_date',
        'get_full_id', 'last_status_display',  # ✅ Qo‘shildi
    )
    list_filter = (
        'send_to_tech_dir', 'tech_dir_confirm',
        'fs_start_date', 'fs_finish_date',
        'project_code',
    )
    search_fields = (
        'fs_part_code', 'fs_part_no', 'fs_part_name',
        'project_code__project_name', 'project_code__project_code',
    )
    readonly_fields = ('create_date','fs_part_code')

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        for field in ['fs_part_no', 'fs_part_name', 'fs_part_price', 'fs_start_date', 'fs_finish_date']:
            form.base_fields[field].required = True
        return form

    @admin.display(description='Full ID')
    def get_full_id(self, obj):
        return obj.full_id or None

    @admin.display(description='Last Action')
    def last_status_display(self, obj):
        try:
            status = ObjectLastStatus.objects.get(full_id=obj.full_id)
            return status.latest_action or None
        except ObjectLastStatus.DoesNotExist:
            return None

    
    
    
@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('partner_code', 'partner_name', 'partner_inn', 'create_user', 'create_time')
    search_fields = ('partner_name', 'partner_inn')
    list_filter = ('create_time',)
    ordering = ('-create_time',)
    


@admin.register(Translation)
class TranslationAdmin(admin.ModelAdmin):
    list_display = ('key', 'en', 'ru', 'uz', 'translated_by', 'update_time')
    search_fields = ('key', 'en', 'ru', 'uz')
    list_filter = ('translated_by', 'update_time')
    readonly_fields = ('create_time', 'update_time')
    ordering = ('key',)




@admin.register(PhaseType)
class PhaseTypeAdmin(admin.ModelAdmin):
    list_display = ('key', 'name', 'is_refusal', 'order')
    search_fields = ('key', 'name')
    list_filter = ('is_refusal',)
    ordering = ('order',)
    
    



@admin.register(ProjectPhase)
class ProjectPhaseAdmin(admin.ModelAdmin):
    list_display = (
        'phase_id',
        'project',
        'phase_type',
        'performed_by',
        'notify_to',
        'is_acknowledged',
        'performed_at',
        'acknowledged_at',
        'is_refusal'
    )
    search_fields = (
        'project__project_name',
        'phase_type__name',
        'performed_by__username',
        'notify_to__username',
    )
    list_filter = ('phase_type', 'is_acknowledged', 'performed_at')
    readonly_fields = ('performed_at', 'acknowledged_at')
    ordering = ('-performed_at',)
    
    @admin.display(boolean=True)
    def is_refusal(self, obj):
        return obj.phase_type.is_refusal



@admin.register(ProjectGipPart)
class ProjectGipPartAdmin(admin.ModelAdmin):
    list_display = (
        'tch_part_code',
        'fs_part_code',
        'tch_part_no',
        'tch_part_name',
        'tch_part_nach',
        'tch_start_date',
        'tch_finish_date',
        'nach_otd_confirm',
        'create_user_id',
        'create_date',
        'full_id_display',
        'path_type_display',
        'last_status_display'
    )
    search_fields = ('tch_part_no', 'tch_part_name')
    list_filter = ('nach_otd_confirm', 'tch_start_date', 'tch_finish_date')
    readonly_fields = ('create_date',)

    def full_id_display(self, obj):
        return obj.full_id
    full_id_display.short_description = "Full ID"

    def path_type_display(self, obj):
        return obj.path_type
    path_type_display.short_description = "Path Type"
    
    
    @admin.display(description='Last Action')
    def last_status_display(self, obj):
        try:
            status = ObjectLastStatus.objects.get(full_id=obj.full_id)
            return status.latest_action or None
        except ObjectLastStatus.DoesNotExist:
            return None





@admin.register(WorkOrder)
class WorkOrderAdmin(admin.ModelAdmin):
    list_display = (
        'wo_id',
        'wo_no',
        'wo_name',
        'tch_part_code',
        'wo_start_date',
        'wo_finish_date',
        'wo_staff',
        'staff_confirm',
        'create_user',
        'create_date',
        'full_id_display',
        'path_type_display',
        'last_status_display',  # ✅ Qo‘shildi
    )
    search_fields = ('wo_name',)
    list_filter = ('staff_confirm', 'wo_start_date', 'wo_finish_date')
    readonly_fields = ('create_date',)

    def full_id_display(self, obj):
        return obj.full_id
    full_id_display.short_description = "Full ID"

    def path_type_display(self, obj):
        return obj.path_type
    path_type_display.short_description = "Path Type"

    @admin.display(description='Last Action')
    def last_status_display(self, obj):
        try:
            status = ObjectLastStatus.objects.get(full_id=obj.full_id)
            return status.latest_action or None
        except ObjectLastStatus.DoesNotExist:
            return None





@admin.register(ActionLog)
class ActionLogAdmin(admin.ModelAdmin):
    list_display = (
        'full_id',
        'path_type',
        'phase_type',
        'performed_by',
        'performed_at',
        'notify_to',
        'identified',
        'identified_time',
    )
    search_fields = ('full_id', 'phase_type__name', 'performed_by__username', 'notify_to__username')
    list_filter = ('path_type', 'phase_type', 'performed_at', 'identified')
    readonly_fields = ('performed_at', 'identified_time')


@admin.register(ObjectLastStatus)
class ObjectLastStatusAdmin(admin.ModelAdmin):
    list_display = (
        'full_id',
        'path_type',
        'latest_phase_type',
        'latest_action',
        'updated_by',
        'last_updated'
    )
    search_fields = ('full_id', 'latest_action', 'latest_phase_type__name')
    list_filter = ('path_type', 'latest_phase_type')
    readonly_fields = ('last_updated',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('message_id', 'sender', 'path_type', 'full_id', 'create_time')
    list_filter = ('path_type', 'create_time')
    search_fields = ('content', 'full_id', 'sender__fio')
    readonly_fields = ('create_time', 'update_time')

    ordering = ('-create_time',)
    
    
    

class ChatMessageFileInline(admin.TabularInline):
    model = ChatMessageFile
    extra = 0
    readonly_fields = ('file_original_name', 'upload_time')
    fields = ('file', 'file_original_name', 'upload_time')  # explicitly list fields

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('message_id', 'task', 'sender', 'receiver', 'message_preview', 'is_read', 'send_time', 'read_time')
    list_filter = ('is_read', 'send_time')
    search_fields = ('sender__fio', 'receiver__fio', 'message', 'task__title')
    inlines = [ChatMessageFileInline]

    def message_preview(self, obj):
        return (obj.message[:40] + '...') if obj.message and len(obj.message) > 40 else obj.message
    message_preview.short_description = "Message"





@admin.register(UserTask)
class UserTaskAdmin(admin.ModelAdmin):
    list_display = ('task_id', 'title', 'receiver', 'create_user', 'done', 'done_time', 'create_time')
    list_filter = ('done', 'create_time')
    search_fields = ('title', 'receiver__fio', 'create_user__fio')
    ordering = ('-create_time',)