from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ActionLog, ObjectLastStatus
from simple_history.signals import pre_create_historical_record



@receiver(post_save, sender=ActionLog)
def update_object_last_status(sender, instance, created, **kwargs):
    if not instance.full_id or not instance.path_type:
        return

    latest_action = instance.phase_type.key if instance.phase_type else 'UNKNOWN'

    ObjectLastStatus.objects.update_or_create(
        full_id=instance.full_id,
        path_type=instance.path_type,
        defaults={
            'latest_action': latest_action,
            'latest_phase_type': instance.phase_type,
            'updated_by': instance.performed_by,
            'comment': instance.comment,  # ✅ moved here
        }
    )







def set_history_display_fields(sender, **kwargs):
    history_instance = kwargs['history_instance']
    obj = kwargs['instance']
    model_name = obj.__class__.__name__

    if model_name == 'Project':
        history_instance.currency_name = getattr(obj.currency, 'currency_name', None) if obj.currency else None
        history_instance.financier_name = getattr(obj.financier, 'username', None) if obj.financier else None
        history_instance.partner_name = getattr(obj.partner, 'partner_name', None) if obj.partner else None
        history_instance.project_gip_name = getattr(obj.project_gip, 'username', None) if obj.project_gip else None
        history_instance.create_username = getattr(obj.create_user, 'username', None) if obj.create_user else None

        history_user = getattr(history_instance, 'history_user', None)
        if history_user:
            history_instance.history_user_display = getattr(history_user, 'username', str(history_user))

    elif model_name == 'ProjectFinancePart':
        history_instance.create_username = getattr(obj.create_user_id, 'username', None) if obj.create_user_id else None
        # You can add more fields to snapshot here if needed in future

        history_user = getattr(history_instance, 'history_user', None)
        if history_user:
            history_instance.history_user_display = getattr(history_user, 'username', str(history_user))
            
            
    elif model_name == 'ProjectGipPart':
        history_instance.create_username = getattr(obj.create_user_id, 'username', None) if obj.create_user_id else None
        history_instance.tch_part_nach_username = getattr(obj.tch_part_nach, 'username', None) if obj.tch_part_nach else None

        history_user = getattr(history_instance, 'history_user', None)
        if history_user:
            history_instance.history_user_display = getattr(history_user, 'username', str(history_user))
    
    
    elif model_name == 'WorkOrderFile':
        history_instance.work_order_id = getattr(obj.work_order, 'wo_id', None) if obj.work_order else None
        history_instance.work_order_name = getattr(obj.work_order, 'wo_name', None) if obj.work_order else None
        history_instance.original_name = obj.original_name

        history_user = getattr(history_instance, 'history_user', None)
        if history_user:
            history_instance.history_user_display = getattr(history_user, 'username', str(history_user))
            
    elif model_name == 'WorkOrder':
        history_instance.tch_part_code_id = getattr(obj.tch_part_code, 'tch_part_code', None)
        history_instance.tch_part_name = getattr(obj.tch_part_code, 'tch_part_name', None)

        history_instance.wo_staff_username = getattr(obj.wo_staff, 'username', None) if obj.wo_staff else None
        history_instance.create_username = getattr(obj.create_user, 'username', None) if obj.create_user else None
        history_instance.holded_for_username = getattr(obj.holded_for, 'username', None) if obj.holded_for else None

        history_user = getattr(history_instance, 'history_user', None)
        if history_user:
            history_instance.history_user_display = getattr(history_user, 'username', str(history_user))
    
    elif model_name == 'StaffUser':
        history_instance.role_name = getattr(obj.role, 'role_name', None) if obj.role else None
        history_instance.position_name = getattr(obj.position, 'position_name', None) if obj.position else None
        history_instance.department_name = getattr(obj.department, 'department_name', None) if obj.department else None
        history_instance.create_username = getattr(obj.create_user, 'username', None) if obj.create_user else None
        history_user = getattr(history_instance, 'history_user', None)
        if history_user:
            history_instance.history_user_display = getattr(history_user, 'username', str(history_user))
    
    # elif model_name == 'AnotherModel':
    #     history_instance.something = obj.something.else...
    #     history_user = getattr(history_instance, 'history_user', None)
    #     if history_user:
    #         history_instance.history_user_display = str(history_user)

pre_create_historical_record.connect(set_history_display_fields)

