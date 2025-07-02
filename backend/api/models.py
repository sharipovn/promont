from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from django.conf import settings
from simple_history.models import HistoricalRecords  # 👈 import this




class Capability(models.Model):
    capability_id = models.AutoField(primary_key=True)
    capability_name = models.CharField(max_length=100, unique=True)  # e.g. CAN_VIEW_USER
    description = models.CharField(max_length=255, blank=True)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'capability'
        verbose_name = 'Capability'
        verbose_name_plural = 'Capabilities'

    def __str__(self):
        return self.capability_name



class Department(models.Model):
    department_id = models.AutoField(primary_key=True)
    department_name = models.CharField(max_length=100, unique=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sub_departments'
    )
    create_user = models.ForeignKey(
        'StaffUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_departments'
    )
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'department'
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'

    def __str__(self):
        return self.department_name



class JobPosition(models.Model):
    position_id = models.AutoField(primary_key=True)
    position_name = models.CharField(max_length=100)
    position_description = models.TextField(blank=True)
    department = models.ForeignKey(
        'Department',  # assumes JobPosition is in same app, else use 'yourapp.Department'
        on_delete=models.CASCADE,
        related_name='job_positions'
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sub_positions',
        help_text='Optional parent position'
    )
    create_user = models.ForeignKey(
        'StaffUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_positions'
    )
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'job_position'
        verbose_name = 'Job Position'
        verbose_name_plural = 'Job Positions'
        unique_together = ('department', 'position_name')  # ✅ Uniqueness per department

    def __str__(self):
        return self.position_name


class StaffUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("Username is required")
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)
        return self.create_user(username, password, **extra_fields)
    
    

class StaffUser(AbstractBaseUser, PermissionsMixin):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    fio = models.CharField(max_length=255)
    position = models.ForeignKey(
        'JobPosition',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='position_id',
        related_name='staff_members'
    )
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, db_column='department_id')
    role = models.ForeignKey(
        'Role',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='role_id'
    )
    create_time = models.DateTimeField(default=timezone.now)
    create_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_staff_users'
    )
    update_time = models.DateTimeField(auto_now=True)  # ✅ this tracks update
    # last_login_time_success = models.DateTimeField(null=True, blank=True)
    last_login_time_fail = models.DateTimeField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # ✅ New fields
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True,default='profile_images/default_profile_image.png')  # relative to MEDIA_ROOT)
    birthday = models.DateField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    on_vocation = models.BooleanField(default=False)
    on_vocation_update = models.DateTimeField(auto_now=True)  # auto-tracks changes
    on_vocation_start = models.DateField(null=True, blank=True)
    on_vocation_end = models.DateField(null=True, blank=True)
    on_business_trip = models.BooleanField(default=False)
    on_business_trip_update = models.DateTimeField(auto_now=True)  # auto-tracks changes
    on_business_trip_start = models.DateField(null=True, blank=True)
    on_business_trip_end = models.DateField(null=True, blank=True)
    pnfl = models.CharField(max_length=20, null=True, blank=True)
    phone_number = models.CharField(max_length=20)  # ✅ required
    position_start_date = models.DateField(null=True, blank=True)


    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['fio', 'phone_number']  # ✅ phone_number added

    objects = StaffUserManager()

    class Meta:
        db_table = 'staff_users'

    @property
    def id(self):
        return self.user_id

    def __str__(self):
        return self.username
    
    def get_capability_names(self):
        if self.role:
            return list(self.role.capabilities.values_list('capability_name', flat=True))
        return []
    
    
class Role(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=100, unique=True)

    created_by = models.ForeignKey(
        'StaffUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_roles'
    )

    capabilities = models.ManyToManyField(
        'Capability',
        related_name='roles',
        blank=True
    )

    create_time = models.DateTimeField(default=timezone.now)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_roles'

    def __str__(self):
        return self.role_name







class Currency(models.Model):
    currency_id = models.AutoField(primary_key=True)
    currency_name = models.CharField(max_length=10, unique=True)  # e.g., 'UZS', 'USD', 'EUR'
    description = models.TextField(blank=True, null=True)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'currencies'
        verbose_name = "Currency"
        verbose_name_plural = "Currencies"

    def __str__(self):
        return self.currency_name

def get_default_currency():
    from .models import Currency
    currency, _ = Currency.objects.get_or_create(currency_name='UZS')
    return currency.pk



class Project(models.Model):
    project_code = models.AutoField(primary_key=True)
    project_name = models.CharField(max_length=255,unique=True)
    contract_number = models.CharField(max_length=255,null=True, blank=True)
    total_price = models.BigIntegerField()
    
    currency  = models.ForeignKey(
        'Currency',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='projects',
        default=get_default_currency  # ← this sets UZS as default
    )

    start_date = models.DateField()
    end_date = models.DateField()

    financier = models.ForeignKey(
        StaffUser, on_delete=models.SET_NULL, null=True,blank=True, related_name='financed_projects'
    )
    financier_confirm = models.BooleanField(default=False)
    financier_confirm_date = models.DateTimeField(null=True, blank=True)

    project_gip = models.ForeignKey(
        StaffUser, on_delete=models.SET_NULL, null=True,blank=True, related_name='gip_projects'
    )
    gip_confirm = models.BooleanField(default=False)
    gip_confirm_date = models.DateTimeField(null=True, blank=True)

    create_user = models.ForeignKey(
        StaffUser, on_delete=models.SET_NULL, null=True, related_name='created_projects'
    )
    partner = models.ForeignKey(
        'Partner',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='projects'
    )
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)


    # ✅ Add this line
    history_user_display = models.CharField(max_length=255, null=True, blank=True)
    history = HistoricalRecords()
    class Meta:
        db_table = 'projects'
        verbose_name = "Project"
        verbose_name_plural = "Projects"

    def __str__(self):
        return f"{self.project_code} - {self.project_name}"

    @property
    def full_id(self):
        try:
            return f"{self.project_code}/"
        except Exception:
            return None

    @property
    def last_status(self):
        from api.models import ObjectLastStatus
        try:
            status = ObjectLastStatus.objects.get(full_id=self.full_id)
            return {
                "latest_action": status.latest_action,
                "latest_phase_type": status.latest_phase_type.name if status.latest_phase_type else None,
                "last_updated": status.last_updated,
                "updated_by": status.updated_by.fio if status.updated_by else None,
                'comment':status.comment
            }
        except ObjectLastStatus.DoesNotExist:
            return None
    
    @property
    def path_type(self):
        return "PROJECT"
        

class ProjectFinancePart(models.Model):
    fs_part_code = models.AutoField(primary_key=True)

    project_code = models.ForeignKey(
        'Project',
        on_delete=models.CASCADE,
        related_name='finance_parts'
    )

    # ✅ Mandatory fields
    fs_part_no = models.CharField(max_length=50)
    fs_part_name = models.CharField(max_length=255)
    fs_part_price = models.BigIntegerField()
    fs_start_date = models.DateField()
    fs_finish_date = models.DateField()

    create_date = models.DateTimeField(auto_now_add=True)

    create_user_id = models.ForeignKey(
        'StaffUser',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_fin_parts'
    )

    send_to_tech_dir = models.BooleanField(default=False)
    send_to_tech_dir_date = models.DateTimeField(null=True, blank=True)

    tech_dir_confirm = models.BooleanField(default=False)
    tech_dir_confirm_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'pro_fin_part'
        verbose_name = "Project Finance Part"
        verbose_name_plural = "Project Finance Parts"
        unique_together = [
            ('project_code', 'fs_part_no'),
            ('project_code', 'fs_part_name'),
        ]

    def __str__(self):
        return f"{self.fs_part_code} - {self.fs_part_name}"
    
    
    @property
    def full_id(self):
        try:
            return f"{self.project_code.project_code}/{self.fs_part_code}/"
        except Exception:
            return None

    @property
    def last_status(self):
        from api.models import ObjectLastStatus
        try:
            status = ObjectLastStatus.objects.get(full_id=self.full_id)
            return {
                "latest_action": status.latest_action,
                "latest_phase_type": status.latest_phase_type.name if status.latest_phase_type else None,
                "last_updated": status.last_updated,
                "updated_by": status.updated_by.fio if status.updated_by else None,
                'comment':status.comment
            }
        except ObjectLastStatus.DoesNotExist:
            return None
        
    @property
    def path_type(self):
        return "FIN_PART"
    


class Partner(models.Model):
    partner_code = models.AutoField(primary_key=True)
    partner_name = models.CharField(max_length=500,unique=True)
    partner_inn = models.CharField(max_length=500)

    create_user = models.ForeignKey(
        StaffUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_partners'
    )

    create_time = models.DateTimeField(default=timezone.now)
    update_time = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.partner_name

    class Meta:
        db_table = 'partners'
        verbose_name = "Partner"
        verbose_name_plural = "Partners"



class Translation(models.Model):
    translation_id=models.AutoField(primary_key=True)
    key = models.CharField(max_length=100, unique=True, help_text="Unique identifier for the text (e.g., 'create_project_admin')")
    en = models.CharField(max_length=250, blank=True, null=True, help_text="English translation")
    ru = models.CharField(max_length=250, blank=True, null=True, help_text="Russian translation")
    uz = models.CharField(max_length=250, blank=True, null=True, help_text="Uzbek translation")
    translated_by = models.ForeignKey(StaffUser,on_delete=models.SET_NULL,null=True,blank=True,related_name='translations',help_text="The staff user who last updated this translation")
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'app_internalization'
        verbose_name = "Translation"
        verbose_name_plural = "Translations"
        ordering = ['key']


    def __str__(self):
        return f"{self.key} ({self.en or self.ru or self.uz or 'No translation'})"
    
    


class PhaseType(models.Model):
    phase_type_id = models.AutoField(primary_key=True)
    key = models.CharField(max_length=50, unique=True)  # Example: SENT_TO_FINANCIER
    name = models.CharField(max_length=100)             # Example: Sent to Financier
    description = models.TextField(blank=True, null=True)
    is_refusal = models.BooleanField(default=False)     # Is this a refusal-type phase?
    order = models.PositiveIntegerField(default=0)      # For frontend timeline sorting

    class Meta:
        db_table = 'project_phase_types'
        verbose_name = "Phase Type"
        verbose_name_plural = "Phase Types"
        ordering = ['order']

    def __str__(self):
        return f"{self.name} ({self.key})"





class ProjectPhase(models.Model):
    phase_id = models.AutoField(primary_key=True)

    project = models.ForeignKey(
        'Project',
        on_delete=models.CASCADE,
        related_name='phases',
        verbose_name="Project"
    )

    phase_type = models.ForeignKey(
        'PhaseType',
        on_delete=models.SET_NULL,
        null=True,
        db_column='phase_type_id',
        verbose_name="Phase Type"
    )

    comment = models.TextField(
        blank=True,
        null=True,
        verbose_name="Comment or Reason"
    )

    performed_by = models.ForeignKey(
        'StaffUser',
        on_delete=models.SET_NULL,
        null=True,
        related_name='performed_project_phases',
        verbose_name="Performed By"
    )

    performed_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Performed At"
    )

    notify_to = models.ForeignKey(
        'StaffUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='phases_to_respond',
        verbose_name="Notify To"
    )

    is_acknowledged = models.BooleanField(
        default=False,
        verbose_name="Acknowledged?"
    )

    acknowledged_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Acknowledged At"
    )

    acknowledged_by = models.ForeignKey(
        'StaffUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='acknowledged_refusals',
        verbose_name="Acknowledged By"
    )

    class Meta:
        db_table = 'project_phases'
        verbose_name = "Project Phase"
        verbose_name_plural = "Project Phases"
        ordering = ['-performed_at']

    def __str__(self):
        return f"{self.project.project_name} - {self.phase_type.name if self.phase_type else 'Unknown'}"

    def acknowledge(self, user):
        """Mark the refusal as acknowledged by the notified user"""
        from django.utils import timezone
        self.is_acknowledged = True
        self.acknowledged_by = user
        self.acknowledged_at = timezone.now()
        self.save(update_fields=['is_acknowledged', 'acknowledged_by', 'acknowledged_at'])





class ProjectGipPart(models.Model):
    tch_part_code = models.AutoField(primary_key=True)

    fs_part_code = models.ForeignKey(
        'ProjectFinancePart',
        on_delete=models.CASCADE,
        related_name='gip_parts'
    )

    tch_part_no = models.CharField(max_length=50)
    tch_part_name = models.CharField(max_length=255)

    tch_part_nach = models.ForeignKey(  # 👈 updated
        'StaffUser',
        on_delete=models.SET_NULL,
        null=True,
        related_name='assigned_tech_parts'
    )

    tch_start_date = models.DateField()
    tch_finish_date = models.DateField()
    create_date = models.DateTimeField(auto_now_add=True)

    create_user_id = models.ForeignKey(
        'StaffUser',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_gip_parts'
    )

    nach_otd_confirm = models.BooleanField(default=False)
    nach_otd_confirm_date = models.DateTimeField(null=True, blank=True)  # ✅ New field

    class Meta:
        db_table = 'project_gip_parts'
        verbose_name = 'Technical Part'
        verbose_name_plural = 'Technical Parts'

    def __str__(self):
        return f"{self.tch_part_no} - {self.tch_part_name}"
    
    
    
    @property
    def full_id(self):
        try:
            project = self.fs_part_code.project_code
            return f"{project.project_code}/{self.fs_part_code.fs_part_code}/{self.tch_part_code}/"
        except Exception:
            return None

    @property
    def last_status(self):
        from api.models import ObjectLastStatus
        try:
            status = ObjectLastStatus.objects.get(full_id=self.full_id)
            return {
                "latest_action": status.latest_action,
                "latest_phase_type": status.latest_phase_type.name if status.latest_phase_type else None,
                "last_updated": status.last_updated,
                "updated_by": status.updated_by.fio if status.updated_by else None,
                'comment':status.comment
            }
        except ObjectLastStatus.DoesNotExist:
            return None

    @property
    def path_type(self):
        return "TECH_PART"




class WorkOrderFile(models.Model):
    work_order = models.ForeignKey(
        'WorkOrder',
        on_delete=models.CASCADE,
        related_name='files'
    )

    file = models.FileField(
        upload_to='work_orders/%Y/%m/%d/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'jpg', 'png'])],
        help_text='Максимальный размер файла: 10 МБ'
    )
    original_name = models.CharField(max_length=255)  # ✅ store original filename
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.original_name and self.file:
            self.original_name = self.file.name
        super().save(*args, **kwargs)

    def __str__(self):
        return f"File for WO-{self.work_order.wo_no}"

    def clean(self):
        super().clean()
        if self.file and self.file.size > 10 * 1024 * 1024:
            from django.core.exceptions import ValidationError
            raise ValidationError("Размер файла не должен превышать 10 МБ.")



class WorkOrder(models.Model):
    wo_id = models.AutoField(primary_key=True)

    tch_part_code = models.ForeignKey(
        'ProjectGipPart',
        on_delete=models.CASCADE,
        related_name='work_orders'
    )

    wo_no = models.IntegerField()
    wo_name = models.CharField(max_length=255)

    wo_start_date = models.DateField()
    wo_finish_date = models.DateField()

    wo_staff = models.ForeignKey(
        'StaffUser',
        on_delete=models.SET_NULL,
        null=True,
        related_name='assigned_work_orders'
    )


    create_user = models.ForeignKey(
        'StaffUser',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_work_orders'
    )
    create_date = models.DateTimeField(auto_now_add=True)
    staff_confirm = models.BooleanField(default=False)
    wo_answer = models.TextField(null=True, blank=True)
    answer_date = models.DateTimeField(null=True, blank=True)
    wo_remark = models.TextField(null=True, blank=True)
    
    finished = models.BooleanField(default=False)
    finished_date = models.DateTimeField(null=True, blank=True)
    
    
    holded = models.BooleanField(default=False)
    holded_date = models.DateTimeField(null=True, blank=True)
    holded_reason=models.TextField(null=True, blank=True)
    holded_for = models.ForeignKey(
        'StaffUser',
        on_delete=models.SET_NULL,
        null=True,
        related_name='holded_fors'
    )
    
    

    class Meta:
        db_table = 'work_orders'
        verbose_name = 'Work Order'
        verbose_name_plural = 'Work Orders'
        
    @property
    def full_id(self):
        try:
            finance_part = self.tch_part_code.fs_part_code
            project = finance_part.project_code
            return f"{project.project_code}/{finance_part.fs_part_code}/{self.tch_part_code.tch_part_code}/{self.wo_id}/"
        except Exception:
            return None

    @property
    def last_status(self):
        from api.models import ObjectLastStatus
        try:
            status = ObjectLastStatus.objects.get(full_id=self.full_id)
            return {
                "latest_action": status.latest_action,
                "latest_phase_type": status.latest_phase_type.name if status.latest_phase_type else None,
                "last_updated": status.last_updated,
                "updated_by": status.updated_by.fio if status.updated_by else None,
                'comment':status.comment
            }
        except ObjectLastStatus.DoesNotExist:
            return None

    @property
    def path_type(self):
        return "WORK_ORDER"



class ActionLog(models.Model):
    action_id = models.AutoField(primary_key=True)

    full_id = models.CharField(max_length=255, help_text="Hierarchical full identifier")
    path_type = models.CharField(max_length=50, help_text="Type: PROJECT, FIN_PART, TECH_PART, WORK_ORDER")

    phase_type = models.ForeignKey(
        PhaseType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="What kind of action (e.g. CONFIRMED, REFUSED, etc)"
    )
    comment = models.TextField(null=True, blank=True)

    performed_by = models.ForeignKey(
        StaffUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='performed_actions'
    )
    performed_at = models.DateTimeField(auto_now_add=True)

    notify_to = models.ForeignKey(
        StaffUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notified_actions'
    )
    identified = models.BooleanField(default=False)
    identified_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'action_logs'
        ordering = ['-performed_at']
        verbose_name = 'Action Log'
        verbose_name_plural = 'Action Logs'

    def __str__(self):
        return f"{self.full_id} | {self.phase_type} by {self.performed_by}"



class ObjectLastStatus(models.Model):
    full_id = models.CharField(max_length=255, unique=True)
    path_type = models.CharField(max_length=50)

    latest_phase_type = models.ForeignKey(
        PhaseType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    latest_action = models.CharField(max_length=100)
    last_updated = models.DateTimeField(auto_now=True)

    updated_by = models.ForeignKey(
        StaffUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_last_statuses'
    )
    comment = models.TextField(null=True, blank=True)  # ✅ Add this field

    class Meta:
        db_table = 'object_last_status'
        verbose_name = 'Last Object Status'
        verbose_name_plural = 'Last Object Statuses'

    def __str__(self):
        return f"{self.full_id} → {self.latest_action}"
    
    
    
    
class Message(models.Model):
    message_id = models.AutoField(primary_key=True)
    content = models.TextField()
    sender = models.ForeignKey(
        StaffUser,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    full_id = models.CharField(max_length=255, db_index=True)
    path_type = models.CharField(max_length=30)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'messages'
        ordering = ['-create_time']
        verbose_name = "Message"
        verbose_name_plural = "Messages"

    def __str__(self):
        return f"Message #{self.message_id} by {self.sender} on {self.path_type}:{self.full_id}"




class UserTask(models.Model):
    task_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    receiver = models.ForeignKey('StaffUser', on_delete=models.CASCADE, related_name='received_tasks')
    create_user = models.ForeignKey(
        'StaffUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_tasks'
    )
    done = models.BooleanField(default=False)
    done_time = models.DateTimeField(null=True, blank=True)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_tasks'
        ordering = ['-create_time']

    def __str__(self):
        return f"{self.create_user.fio} → {self.receiver.fio} {self.title}"




class ChatMessage(models.Model):
    message_id = models.AutoField(primary_key=True)
    task = models.ForeignKey('UserTask', on_delete=models.CASCADE, related_name='chat_messages')  # ✅ link to task
    sender = models.ForeignKey('StaffUser', on_delete=models.CASCADE, related_name='sent_chat_messages')
    receiver = models.ForeignKey('StaffUser', on_delete=models.CASCADE, related_name='received_chat_messages')
    message = models.TextField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    send_time = models.DateTimeField(default=timezone.now)
    read_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['send_time']

    def __str__(self):
        return f"{self.sender.fio} → {self.receiver.fio} | {self.message or '📎 File'}"


class ChatMessageFile(models.Model):
    chat_message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='chat_files/%Y/%m/%d/')
    file_original_name = models.CharField(max_length=500, blank=True, null=True)  # ✅ fixed
    upload_time = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.file and self.file.size > 300 * 1024 * 1024:
            raise ValidationError("Each file must be 300MB or less.")

    def save(self, *args, **kwargs):
        if self.file and not self.file_original_name:
            self.file_original_name = self.file.name
        super().save(*args, **kwargs)

    def __str__(self):
        return self.file_original_name or 'Unnamed File'


