# api/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from api.models import StaffUser

class StaffUserTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user: StaffUser):
        token = super().get_token(user)

        token["user_id"] = user.user_id
        token["username"] = user.username
        token["fio"] = user.fio
        token["position"] = user.position
        token["role"] = user.role.role_name if user.role else None
        token["capabilities"] = list(
            user.role.capabilities.values_list("capability_name", flat=True)
        ) if user.role else []

        return token
