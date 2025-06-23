from rest_framework import serializers
from api.models import Project, ProjectFinancePart, ProjectGipPart, WorkOrder, WorkOrderFile,Message


class WorkOrderFileSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField(method_name='get_file')  # ✅ Explicit
    class Meta:
        model = WorkOrderFile
        fields = ['id', 'original_name', 'file']

    
    def get_file(self, obj):
        request = self.context.get('request')
        if request and hasattr(obj.file, 'url'):
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url
    
    
class WorkOrderSerializer(serializers.ModelSerializer):
    files = WorkOrderFileSerializer(many=True, read_only=True)
    wo_staff_fio = serializers.CharField(source='wo_staff.fio', read_only=True)
    message_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = WorkOrder
        fields = [
            'wo_id', 'wo_no', 'wo_name', 'wo_start_date', 'wo_finish_date',
            'wo_staff', 'staff_confirm', 'full_id', 'files', 'last_status',
            'wo_answer','wo_remark','wo_staff_fio','staff_confirm','path_type','message_count',
        ]

    def get_last_status(self, obj):
        return getattr(obj, 'last_status', None)
    
    def get_message_count(self, obj):
        return Message.objects.filter(full_id=obj.full_id, path_type=obj.path_type).count()


class TechnicalPartSerializer(serializers.ModelSerializer):
    work_orders = serializers.SerializerMethodField()
    full_id = serializers.CharField(read_only=True)
    path_type = serializers.CharField(read_only=True)
    last_status = serializers.SerializerMethodField()
    tech_create_user=serializers.SerializerMethodField(read_only=True)
    tch_part_nach=serializers.SerializerMethodField(read_only=True)
    message_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProjectGipPart
        fields = [
             'tch_part_code', 'tch_part_no', 'tch_part_name',
            'tch_part_nach', 'tch_start_date', 'tch_finish_date',
            'create_date', 'nach_otd_confirm', 'nach_otd_confirm_date',
            'full_id', 'work_orders', 'last_status','path_type','tech_create_user',
            'message_count'
        ]

    def get_tech_create_user(self, obj):
        return getattr(obj.create_user_id, 'fio', None) if obj.create_user_id else None
    
    def get_tch_part_nach(self, obj):
        return getattr(obj.tch_part_nach, 'fio', None) if obj.tch_part_nach else None

    def get_last_status(self, obj):
        return getattr(obj, 'last_status', None)

    def get_message_count(self, obj):
        return Message.objects.filter(full_id=obj.full_id, path_type=obj.path_type).count()

    def get_work_orders(self, obj):
        user = self.context['request'].user
        caps = set(user.get_capability_names())

        if caps & {'IS_TECH_DIR', 'IS_FIN_DIR', 'IS_FINANCIER', 'IS_GIP'}:
            return WorkOrderSerializer(obj.work_orders.all(), many=True, context=self.context).data

        if 'IS_NACH_OTDEL' in caps and obj.tch_part_nach == user:
            return WorkOrderSerializer(obj.work_orders.all(), many=True, context=self.context).data

        if 'IS_STAFF' in caps:
            return WorkOrderSerializer(obj.work_orders.filter(wo_staff=user), many=True, context=self.context).data

        return []


class FinancePartSerializer(serializers.ModelSerializer):
    gip_parts = serializers.SerializerMethodField()
    full_id = serializers.CharField(read_only=True)
    last_status = serializers.SerializerMethodField()
    path_type = serializers.CharField(read_only=True)
    fs_create_user = serializers.SerializerMethodField(read_only=True)
    message_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProjectFinancePart
        fields = [
            'fs_part_code', 'fs_part_no', 'fs_part_name',
            'fs_part_price', 'fs_start_date', 'fs_finish_date',
            'create_date', 'send_to_tech_dir', 'tech_dir_confirm',
            'full_id', 'gip_parts', 'last_status','path_type','fs_create_user',
            'message_count',
        ]

    def get_fs_create_user(self, obj):
        return getattr(obj.create_user_id, 'fio', None) if obj.create_user_id else None

    def get_message_count(self, obj):
        return Message.objects.filter(full_id=obj.full_id, path_type=obj.path_type).count()

    def get_last_status(self, obj):
        return getattr(obj, 'last_status', None)

    def get_gip_parts(self, obj):
        user = self.context['request'].user
        caps = set(user.get_capability_names())
        all_parts = obj.gip_parts.all()

        if caps & {'IS_TECH_DIR', 'IS_FIN_DIR', 'IS_FINANCIER', 'IS_GIP'}:
            return TechnicalPartSerializer(all_parts, many=True, context=self.context).data

        if 'IS_NACH_OTDEL' in caps:
            filtered = all_parts.filter(tch_part_nach=user)
            return TechnicalPartSerializer(filtered, many=True, context=self.context).data

        if 'IS_STAFF' in caps:
            filtered = all_parts.filter(work_orders__wo_staff=user).distinct()
            return TechnicalPartSerializer(filtered, many=True, context=self.context).data

        return []


class SpecialProjectSerializer(serializers.ModelSerializer):
    finance_parts = serializers.SerializerMethodField()
    full_id = serializers.CharField(read_only=True)
    last_status = serializers.SerializerMethodField()
    path_type = serializers.CharField(read_only=True)
    p_create_user_fio = serializers.SerializerMethodField(read_only=True)
    p_financier_fio = serializers.SerializerMethodField(read_only=True)
    p_gip_fio = serializers.SerializerMethodField(read_only=True)
    message_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Project
        fields = [
            'project_code', 'project_name', 'start_date', 'end_date', 'total_price',
            'create_date', 'create_user', 'financier','message_count',
            'full_id', 'finance_parts', 'last_status','path_type','p_create_user_fio',
            'p_financier_fio','p_gip_fio'
        ]
    def get_last_status(self, obj):
        return getattr(obj, 'last_status', None)

    def get_message_count(self, obj):
        return Message.objects.filter(full_id=obj.full_id, path_type=obj.path_type).count()

    def get_p_create_user_fio(self, obj):
        return obj.create_user.fio if obj.create_user and obj.create_user.fio else "—"
        
    def get_p_gip_fio(self, obj):
        return obj.project_gip.fio if obj.project_gip and obj.project_gip.fio else "—"

    def get_p_financier_fio(self, obj):
        return obj.financier.fio if obj.financier and obj.financier.fio else "—"
        
    def get_finance_parts(self, obj):
        user = self.context['request'].user
        caps = set(user.get_capability_names())
        all_parts = obj.finance_parts.all()

        if caps & {'IS_TECH_DIR', 'IS_FIN_DIR', 'IS_FINANCIER', 'IS_GIP'} or obj.create_user == user:
            return FinancePartSerializer(all_parts, many=True, context=self.context).data

        if 'IS_NACH_OTDEL' in caps:
            filtered = [part for part in all_parts if part.gip_parts.filter(tch_part_nach=user).exists()]
            return FinancePartSerializer(filtered, many=True, context=self.context).data

        if 'IS_STAFF' in caps:
            filtered = [part for part in all_parts if part.gip_parts.filter(work_orders__wo_staff=user).exists()]
            return FinancePartSerializer(filtered, many=True, context=self.context).data

        return []







class MessageSerializer(serializers.ModelSerializer):
    sender_fio = serializers.SerializerMethodField()
    sender_position = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['message_id', 'content', 'create_time', 'sender_fio', 'sender_position']

    def get_sender_fio(self, obj):
        return getattr(obj.sender, 'fio', str(obj.sender)) if obj.sender else None

    def get_sender_position(self, obj):
        return getattr(obj.sender.position, 'position_name', None) if obj.sender and obj.sender.position else None