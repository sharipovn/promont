# api/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from api.models import StaffUser,Project,ProjectFinancePart,Partner,Translation,Department,ProjectGipPart
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
    technical_parts_count = serializers.SerializerMethodField(read_only=True)  # 🔥 Yangi qo‘shilmoqda
    all_sent_to_tech_dir = serializers.SerializerMethodField()
    all_tech_dir_confirmed = serializers.SerializerMethodField()
    partner_name = serializers.CharField(source='partner.partner_name', read_only=True)
    partner_inn = serializers.CharField(source='partner.partner_inn', read_only=True)
    current_phase = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = [
            'project_code', 'create_user', 'create_date', 'update_date',
            'create_user_fio', 'financier_fio','finance_parts_count','technical_parts_count','all_sent_to_tech_dir','all_tech_dir_confirmed','partner_name','partner_inn','current_phase'
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
    
    def get_technical_parts_count(self, obj):
        return ProjectGipPart.objects.filter(fs_part_code__project_code=obj).count()
    
    def get_all_sent_to_tech_dir(self, obj):
        return obj.finance_parts.filter(send_to_tech_dir=False).count() == 0
    
    def get_all_tech_dir_confirmed(self, obj):
        return all(part.tech_dir_confirm for part in obj.finance_parts.all())

    def get_current_phase(self, obj):
        latest_phase = obj.phases.order_by('-performed_at').first()
        if latest_phase and latest_phase.phase_type:
            return {
                "key": latest_phase.phase_type.key,
                "name": latest_phase.phase_type.name,
                "is_refusal": latest_phase.phase_type.is_refusal,
                "date": latest_phase.performed_at,
                "comment": latest_phase.comment,
            }
        return None

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
        
class TechnicalPartSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectGipPart
        fields = ['tch_part_no', 'tch_part_name', 'tch_part_nach', 'tch_start_date', 'tch_finish_date']


class ProjectFinancePartSerializer(serializers.ModelSerializer):
    financier_fio = serializers.SerializerMethodField(read_only=True)
    existing_tech_parts = TechnicalPartSerializer(source='gip_parts', many=True, read_only=True)
    
    class Meta:
        model = ProjectFinancePart
        fields = '__all__'
        
    def get_financier_fio(self, obj):
        if obj.create_user_id:
            return f"{obj.create_user_id.fio}"
        return None

class PartnerSerializer(serializers.ModelSerializer):
    create_user_fio = serializers.CharField(source='create_user.fio', read_only=True)

    class Meta:
        model = Partner
        fields = [
            'partner_code',
            'partner_name',
            'partner_inn',
            'create_time',
            'update_time',
            'create_user_fio',
        ]
        
        
class TranslationSerializer(serializers.ModelSerializer):
    translated_by_fio = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Translation
        fields = [
            'translation_id', 'key', 'en', 'ru', 'uz',
            'translated_by', 'translated_by_fio',
            'create_time', 'update_time'
        ]
        read_only_fields = ['translation_id', 'translated_by', 'translated_by_fio', 'create_time', 'update_time']

    def get_translated_by_fio(self, obj):
        if obj.translated_by:
            return f"{obj.translated_by.fio} ({obj.translated_by.username})"
        return None
        
        
class DepartmentSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.department_name', read_only=True)
    create_user_fio = serializers.CharField(source='create_user.fio', read_only=True)

    class Meta:
        model = Department
        fields = [
            'department_id',
            'department_name',
            'parent',
            'parent_name',
            'create_user_fio',
            'create_time',
            'update_time',
        ]