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







def set_history_user_display(sender, **kwargs):
    history_instance = kwargs['history_instance']
    history_user = getattr(history_instance, 'history_user', None)
    if history_user:
        history_instance.history_user_display = str(history_user)

pre_create_historical_record.connect(set_history_user_display)
