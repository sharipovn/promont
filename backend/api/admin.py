from django.contrib import admin
from .models import Capability, Department,StaffUser,Role,Project,ProjectFinancePart,Partner,Translation
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



@admin.register(StaffUser)
class StaffUserAdmin(UserAdmin):
    model = StaffUser
    list_display = ('user_id', 'username', 'fio', 'position', 'is_staff', 'is_active','last_login','create_time','department','role')
    search_fields = ('username', 'fio')
    ordering = ('user_id',)

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('fio', 'position', 'department','role')}),
        ('Login Info', {'fields': ('last_login', 'last_login_time_fail')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Timestamps', {'fields': ('create_time',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'fio', 'position', 'department', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
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
        'project_code', 'project_name', 'total_price',
        'start_date', 'end_date',
        'financier', 'financier_confirm', 'financier_confirm_date',
        'project_gip', 'gip_confirm', 'gip_confirm_date',
        'create_user', 'create_date', 'update_date',
    )
    list_filter = ('financier_confirm', 'gip_confirm', 'start_date', 'end_date')
    search_fields = ('project_code', 'project_name')
    
    
    
    
@admin.register(ProjectFinancePart)
class ProjectFinancePartAdmin(admin.ModelAdmin):
    list_display = (
        'fs_part_code', 'fs_part_no', 'fs_part_name', 'fs_part_price',
        'fs_start_date', 'fs_finish_date',
        'project_code',
        'create_user_id', 'create_date',
        'send_to_tech_dir', 'send_to_tech_dir_date',
        'tech_dir_confirm', 'tech_dir_confirm_date',
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

