from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.db import models



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
    position = models.CharField(max_length=100, null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, db_column='department_id')
    role = models.ForeignKey(
        'Role',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='role_id'
    )
    create_time = models.DateTimeField(default=timezone.now)
    update_time = models.DateTimeField(auto_now=True)  # ✅ this tracks update
    # last_login_time_success = models.DateTimeField(null=True, blank=True)
    last_login_time_fail = models.DateTimeField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['fio']

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



class Project(models.Model):
    project_code = models.AutoField(primary_key=True)
    project_name = models.CharField(max_length=255,unique=True)
    total_price = models.BigIntegerField()

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

    class Meta:
        db_table = 'projects'
        verbose_name = "Project"
        verbose_name_plural = "Projects"

    def __str__(self):
        return f"{self.project_code} - {self.project_name}"


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

    def __str__(self):
        return f"{self.fs_part_code} - {self.fs_part_name}"
    


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
    tch_part_nach = models.BigIntegerField()
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
    class Meta:
        db_table = 'project_gip_parts'
        verbose_name = 'Technical Part'
        verbose_name_plural = 'Technical Parts'

    def __str__(self):
        return f"{self.tch_part_no} - {self.tch_part_name}"
