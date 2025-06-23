# api/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from api.models import StaffUser,Project,ProjectFinancePart,Partner,UserTask,Translation,Department,ProjectGipPart,ChatMessage,ActionLog,WorkOrder,WorkOrderFile,PhaseType,Role,JobPosition,ChatMessageFile
from rest_framework import serializers



class StaffUserTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user: StaffUser):
        token = super().get_token(user)

        token["user_id"] = user.user_id
        token["username"] = user.username
        token["fio"] = user.fio
        token["position"] = user.position.position_name if user.position else None
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
    last_status = serializers.SerializerMethodField(read_only=True)
    full_id = serializers.CharField(read_only=True)
    path_type = serializers.CharField(read_only=True)
    
    work_order_count = serializers.SerializerMethodField(read_only=True)
    work_order_confirmed_count = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = [
            'project_code', 'create_user', 'create_date', 'update_date',
            'create_user_fio', 'financier_fio','finance_parts_count','technical_parts_count',
            'all_sent_to_tech_dir','all_tech_dir_confirmed','partner_name','partner_inn',
            'work_order_count', 'work_order_confirmed_count','full_id','path_type','last_status',
        ]
        
    def get_create_user_fio(self, obj):
        if obj.create_user:
            position_name = obj.create_user.position.position_name if obj.create_user.position else '---'
            return f"{obj.create_user.fio} ({position_name})"
        return None


    def get_financier_fio(self, obj):
        if obj.financier:
            position_name = obj.financier.position.position_name if obj.financier.position else '---'
            return f"{obj.financier.fio} ({position_name})"
        return None


    def get_last_status(self, obj):
        return getattr(obj, 'last_status', None)
    
    def get_finance_parts_count(self, obj):
        return obj.finance_parts.count() if hasattr(obj, 'finance_parts') and obj.finance_parts is not None else 0
    
    def get_technical_parts_count(self, obj):
        return ProjectGipPart.objects.filter(fs_part_code__project_code=obj).count()
    
    def get_all_sent_to_tech_dir(self, obj):
        return obj.finance_parts.filter(send_to_tech_dir=False).count() == 0
    
    def get_all_tech_dir_confirmed(self, obj):
        return all(part.tech_dir_confirm for part in obj.finance_parts.all())        
    
    def get_work_order_count(self, obj):
        return WorkOrder.objects.filter(tch_part_code__fs_part_code__project_code=obj).count()

    def get_work_order_confirmed_count(self, obj):
        return WorkOrder.objects.filter(
            tch_part_code__fs_part_code__project_code=obj,
            finished=True
        ).count()


class StaffUserSimpleSerializer(serializers.ModelSerializer):
    position = serializers.SerializerMethodField()
    class Meta:
        model = StaffUser
        fields = ['user_id', 'username', 'fio', 'position']
    def get_position(self, obj):
        return obj.position.position_name if obj.position else None
        
        
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
        read_only_fields = ['create_user_id', 'create_date']  # Prevent overriding in update
        
    def get_financier_fio(self, obj):
        return getattr(obj.create_user_id, 'fio', None) if obj.create_user_id else None
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['create_user_id'] = request.user
        return super().create(validated_data)


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
        return f"{obj.translated_by.fio} ({obj.translated_by.username})" if obj.translated_by else None

        
        
        
class SimpleJobPositionSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    parent_name = serializers.CharField(source='parent.position_name', read_only=True)
    create_user_fio = serializers.CharField(source='create_user.fio', read_only=True)

    class Meta:
        model = JobPosition
        fields = [
            'position_id',
            'position_name',
            'position_description',
            'department',
            'department_name',
            'parent',
            'parent_name',
            'create_user',
            'create_user_fio',
            'create_time',
            'update_time',
        ]
        

class JobCreatePositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosition
        fields = [
            'position_name',
            'position_description',
            'department',
            'parent'
        ]
        
        
        
        
class DepartmentSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.department_name', read_only=True)
    create_user_fio = serializers.CharField(source='create_user.fio', read_only=True)
    job_positions = SimpleJobPositionSerializer(many=True, read_only=True)

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
            'job_positions',  # ✅ added
        ]
    

        
        
class ProjectSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['project_code', 'project_name', 'start_date', 'end_date', 'total_price']


class ProjectFinancePartSimpleSerializer(serializers.ModelSerializer):
    project = ProjectSimpleSerializer(source='project_code', read_only=True)

    class Meta:
        model = ProjectFinancePart
        fields = ['fs_part_code', 'fs_part_no', 'fs_part_name', 'fs_part_price', 'fs_start_date', 'fs_finish_date', 'project']



class ProjectGipPartSerializer(serializers.ModelSerializer):
    finance_part = ProjectFinancePartSimpleSerializer(source='fs_part_code', read_only=True)
    tch_part_nach_fio = serializers.CharField(source='tch_part_nach.fio', read_only=True)
    create_user_fio = serializers.CharField(source='create_user_id.fio', read_only=True)
    full_id = serializers.CharField(read_only=True)
    path_type = serializers.CharField(read_only=True)
    last_status = serializers.SerializerMethodField()
    count_of_work_orders = serializers.SerializerMethodField()

    class Meta:
        model = ProjectGipPart
        fields = [
            'tch_part_code',
            'fs_part_code',
            'finance_part',
            'tch_part_no',
            'tch_part_name',
            'tch_part_nach',
            'tch_part_nach_fio',
            'tch_start_date',
            'tch_finish_date',
            'create_date',
            'create_user_id',
            'create_user_fio',
            'nach_otd_confirm',
            'nach_otd_confirm_date',
            'full_id',
            'path_type',
            'last_status',
            'count_of_work_orders',  # ✅ Added count here
        ]
    def get_count_of_work_orders(self, obj):
        return obj.work_orders.count()

    def get_last_status(self, obj):
        from .models import ObjectLastStatus
        try:
            status = ObjectLastStatus.objects.get(full_id=obj.full_id)
            return {
                "latest_action": status.latest_action,
                "latest_phase_type": status.latest_phase_type.name if status.latest_phase_type else None,
                "last_updated": status.last_updated,
                "updated_by": status.updated_by.fio if status.updated_by else None,
            }
        except ObjectLastStatus.DoesNotExist:
            return None




class ActionLogSerializer(serializers.ModelSerializer):
    performed_by_fio = serializers.CharField(source='performed_by.fio', read_only=True)
    notify_to_fio = serializers.CharField(source='notify_to.fio', read_only=True)
    phase_type_key = serializers.CharField(source='phase_type.key', read_only=True)
    phase_type_name = serializers.CharField(source='phase_type.name', read_only=True)

    class Meta:
        model = ActionLog
        fields = [
            'action_id',
            'full_id',
            'path_type',
            'phase_type',
            'phase_type_key',
            'phase_type_name',
            'comment',
            'performed_by',
            'performed_by_fio',
            'performed_at',
            'notify_to',
            'notify_to_fio',
            'identified',
            'identified_time',
        ]
        read_only_fields = ['action_id', 'performed_by', 'performed_at', 'notify_to', 'identified', 'identified_time']
        
        





class WorkOrderCreateSerializer(serializers.ModelSerializer):
    wo_staff = serializers.PrimaryKeyRelatedField(queryset=StaffUser.objects.all())

    class Meta:
        model = WorkOrder
        fields = [
            'wo_no',
            'wo_name',
            'wo_start_date',
            'wo_finish_date',
            'wo_staff'
        ]


class WorkOrderSerializer(serializers.ModelSerializer):
    wo_id = serializers.IntegerField(required=False)
    class Meta:
        model = WorkOrder
        fields = [
            'wo_id',           # ✅ Include this for update logic
            'wo_no',
            'wo_name',
            'wo_start_date',
            'wo_finish_date',
            'wo_staff'
        ]

class WorkOrderFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = WorkOrderFile
        fields = ['id', 'file_url', 'name','original_name']

    def get_file_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url)

    def get_name(self, obj):
        return obj.file.name.split('/')[-1]  # Just the file name, not full path



class CompleteWorkOrderSerializer(serializers.ModelSerializer):
    tech_part = ProjectGipPartSerializer(source='tch_part_code', read_only=True)
    wo_staff_fio = serializers.CharField(source='wo_staff.fio', read_only=True)
    last_status = serializers.SerializerMethodField()
    full_id = serializers.CharField(read_only=True)
    files = WorkOrderFileSerializer(many=True, read_only=True)

    class Meta:
        model = WorkOrder
        fields = [
            'wo_id',
            'wo_no',
            'wo_name',
            'wo_start_date',
            'wo_finish_date',
            'wo_staff',
            'wo_staff_fio',
            'staff_confirm',
            'last_status',
            'tech_part',
            'full_id',
            'files',
            'wo_answer',
            'wo_remark',
            'answer_date',
            'finished',
            'finished_date',
        ]

    def get_last_status(self, obj):
        from .models import ObjectLastStatus
        try:
            status = ObjectLastStatus.objects.get(full_id=obj.full_id)
            return {
                "latest_action": status.latest_action,
                "latest_phase_type": status.latest_phase_type.name if status.latest_phase_type else None,
                "is_refused": status.latest_phase_type.is_refusal if status.latest_phase_type else False,
                "updated_by": status.updated_by.fio if status.updated_by else None,
                "last_updated": status.last_updated,
                'comment':status.comment,
            }
        except ObjectLastStatus.DoesNotExist:
            return None


class PhaseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhaseType
        fields = ['key', 'name', 'description', 'is_refusal']



class ActionLogNotificationSerializer(serializers.ModelSerializer):
    performed_by_fio = serializers.CharField(source='performed_by.fio', read_only=True)
    object_data = serializers.SerializerMethodField()
    phase_type = PhaseTypeSerializer(read_only=True)  # nested serializer here

    class Meta:
        model = ActionLog
        fields = [
            'action_id',
            'full_id',
            'path_type',
            'phase_type',
            'comment',
            'performed_at',
            'performed_by_fio',
            'object_data',
        ]

    def get_object_data(self, obj):
        try:
            parts = obj.full_id.strip('/').split('/')
            if obj.path_type == "PROJECT":
                project_code = int(parts[0])
                project = Project.objects.get(project_code=project_code)
                return {"name": project.project_name}

            elif obj.path_type == "FIN_PART":
                project_code, fs_part_code = map(int, parts[:2])
                part = ProjectFinancePart.objects.get(fs_part_code=fs_part_code)
                return {"name": part.fs_part_name}

            elif obj.path_type == "TECH_PART":
                project_code, fs_part_code, tch_part_code = map(int, parts[:3])
                tech = ProjectGipPart.objects.get(tch_part_code=tch_part_code)
                return {"name": tech.tch_part_name}

            elif obj.path_type == "WORK_ORDER":
                project_code, fs_part_code, tch_part_code, wo_id = map(int, parts[:4])
                wo = WorkOrder.objects.get(wo_id=wo_id)
                return {"name": wo.wo_name}
        except Exception as e:
            return None





#for staffusersmanagement
class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['role_name']
        
class StaffManagementUserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    position =  SimpleJobPositionSerializer(read_only=True)

    class Meta:
        model = StaffUser
        fields = [
            'user_id',  # ✅ ADD THIS LINE
            'username',
            'fio',
            'position',
            'department',
            'role',
            'create_time',
            'update_time',
            'profile_image',
            'birthday',
            'address',
            'on_vocation',
            'on_vocation_update',
            'on_vocation_start',
            'on_vocation_end',
            'pnfl',
            'phone_number',
            'position_start_date',
        ]

        
        
class StaffUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffUser
        fields = [
            'fio',
            'position',
            'position_start_date',
            'department',
            'birthday',
            'address',
            'pnfl',
            'phone_number',
            'profile_image',
        ]

    def validate_profile_image(self, file):
        if file and file.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("Image must be 10MB or less.")
        return file
    def validate_position(self, value):
        if value is not None and not JobPosition.objects.filter(pk=value.pk).exists():
            raise serializers.ValidationError("Invalid job position.")
        return value
    
    
    
    
    




class JobPositionNestedSerializer(serializers.ModelSerializer):
    sub_positions = serializers.SerializerMethodField()

    class Meta:
        model = JobPosition
        fields = ['position_id', 'position_name', 'position_description', 'sub_positions']

    def get_sub_positions(self, obj):
        children = obj.sub_positions.all()
        return JobPositionNestedSerializer(children, many=True).data


class MyDepartmentTreeSerializer(serializers.ModelSerializer):
    sub_departments = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['department_id', 'department_name', 'sub_departments']

    def get_sub_departments(self, obj):
        children = obj.sub_departments.all().order_by('department_name')
        return MyDepartmentTreeSerializer(children, many=True).data
    
    


class MyStaffTreeSerializer(serializers.ModelSerializer):
    position_name = serializers.CharField(source='position.position_name', read_only=True)
    profile_image = serializers.ImageField()

    class Meta:
        model = StaffUser
        fields = ['user_id','username', 'fio', 'position_name', 'profile_image', 'on_vocation']


class StaffUserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffUser
        fields = ['user_id', 'fio', 'profile_image']


class ChatMessageFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessageFile
        fields = ['file_original_name', 'file_url','file_size']

    def get_file_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if obj.file else None

    def get_file_size(self, obj):
        try:
            size_bytes = obj.file.size
            if size_bytes < 1024 * 1024:
                return f"{round(size_bytes / 1024, 1)} KB"
            else:
                return f"{round(size_bytes / (1024 * 1024), 1)} MB"
        except Exception:
            return "0 KB"  # File missing or inaccessible


class ChatMessageSerializer(serializers.ModelSerializer):
    sender = StaffUserMiniSerializer(read_only=True)
    receiver = StaffUserMiniSerializer(read_only=True)
    is_me = serializers.SerializerMethodField()
    files = ChatMessageFileSerializer(many=True, read_only=True)

    class Meta:
        model = ChatMessage
        fields = [
            'message_id', 'message', 'sender', 'receiver',
            'send_time', 'read_time', 'is_me', 'files','is_read',
        ]

    def get_is_me(self, obj):
        request = self.context.get('request')
        return obj.sender == request.user if request else False


class UserTaskSerializer(serializers.ModelSerializer):
    sender = MyStaffTreeSerializer(source='create_user', read_only=True)
    receiver = MyStaffTreeSerializer(read_only=True)
    receiver_is_me = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = UserTask
        fields = [
            'task_id', 'title', 'done', 'done_time',
            'create_time', 'update_time',
            'sender', 'receiver', 'receiver_is_me','message_count','unread_count'
        ]

    def get_receiver_is_me(self, obj):
        request = self.context.get('request')
        return request and obj.receiver == request.user
    
    def get_message_count(self, obj):
        return obj.chat_messages.count()

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return obj.chat_messages.filter(is_read=False, receiver=request.user).count()
    
    





class UnreadSimpleMessageSerializer(serializers.ModelSerializer):
    sender_fio = serializers.CharField(source='sender.fio', read_only=True)
    receiver_fio = serializers.CharField(source='receiver.fio', read_only=True)
    task_id = serializers.IntegerField(source='task.task_id', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    files = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = [
            'message_id', 'message', 'sender_fio', 'receiver_fio',
            'task_id', 'task_title', 'files', 'send_time'
        ]

    def get_files(self, obj):
        return [{
            'file_original_name': f.file_original_name,
            'file_url': self.context['request'].build_absolute_uri(f.file.url),
        } for f in obj.files.all()]