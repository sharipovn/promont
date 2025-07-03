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

    # elif model_name == 'AnotherModel':
    #     history_instance.something = obj.something.else...
    #     history_user = getattr(history_instance, 'history_user', None)
    #     if history_user:
    #         history_instance.history_user_display = str(history_user)

pre_create_historical_record.connect(set_history_display_fields)

