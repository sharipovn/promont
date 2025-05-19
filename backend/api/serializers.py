# api/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from api.models import StaffUser,Project,ProjectFinancePart
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
    finance_parts_count = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = [
            'project_code', 'create_user', 'create_date', 'update_date',
            'create_user_fio', 'financier_fio','finance_parts_count'
        ]
        
    def get_create_user_fio(self, obj):
        if obj.create_user:
            return f"{obj.create_user.fio} ({obj.create_user.position or '---'})"
        return None

    def get_financier_fio(self, obj):
        if obj.financier:
            return f"{obj.financier.fio} ({obj.financier.position or '---'})"
        return None

    def get_finance_parts_count(self, obj):
        return obj.finance_parts.count()


class StaffUserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffUser
        fields = ['user_id', 'username', 'fio', 'position']
        
        
        
class ProjectFinancePartCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectFinancePart
        fields = [
            'fs_part_code',
            'project_code',
            'fs_part_no',
            'fs_part_name',
            'fs_part_price',
            'fs_start_date',
            'fs_finish_date',
            'create_user_id',
        ]
        read_only_fields = ['fs_part_code']