# api/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from api.models import StaffUser,Project
from rest_framework import serializers



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



class ProjectSerializer(serializers.ModelSerializer):    
    create_user_fio = serializers.SerializerMethodField(read_only=True)
    financier_fio = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = [
            'project_code', 'create_user', 'create_date', 'update_date',
            'create_user_fio', 'financier_fio'
        ]
        
    def get_create_user_fio(self, obj):
        if obj.create_user:
            return f"{obj.create_user.fio} ({obj.create_user.position or '---'})"
        return None

    def get_financier_fio(self, obj):
        if obj.financier:
            return f"{obj.financier.fio} ({obj.financier.position or '---'})"
        return None



class StaffUserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffUser
        fields = ['user_id', 'username', 'fio', 'position']