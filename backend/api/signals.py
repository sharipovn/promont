from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ActionLog, ObjectLastStatus

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
