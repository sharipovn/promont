from rest_framework import serializers, generics
from api.models import Project, ProjectGipPart, ProjectFinancePart, WorkOrder, WorkOrderFile, ObjectLastStatus

def has_tree_access(user, project=None, finance_part=None, tech_part=None, work_order=None):
    if not user or not user.is_authenticated:
        return False

    if project and project.create_user == user:
        return True
    if finance_part:
        if finance_part.create_user_id == user:
            return True
        if WorkOrder.objects.filter(tch_part_code__fs_part_code=finance_part, wo_staff=user).exists():
            return True
    if tech_part and tech_part.create_user_id == user:
        return True
    if work_order:
        if work_order.create_user == user:
            return True
        if work_order.wo_staff == user:
            return True

    if tech_part:
        if WorkOrder.objects.filter(tch_part_code=tech_part, wo_staff=user).exists():
            return True

    if project:
        if WorkOrder.objects.filter(tch_part_code__fs_part_code__project_code=project, wo_staff=user).exists():
            return True

    return False


class SpecialWorkOrderFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = WorkOrderFile
        fields = ['id', 'file_url', 'name', 'original_name']

    def get_file_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url

    def get_name(self, obj):
        return obj.file.name.split('/')[-1]


class SpecialWorkOrderSerializer(serializers.ModelSerializer):
    full_id = serializers.CharField(read_only=True)
    wo_staff_fio = serializers.CharField(source='wo_staff.fio', read_only=True)
    files = SpecialWorkOrderFileSerializer(many=True, read_only=True)
    last_status = serializers.SerializerMethodField()

    class Meta:
        model = WorkOrder
        fields = [
            'wo_id', 'wo_no', 'wo_name',
            'wo_start_date', 'wo_finish_date',
            'wo_staff', 'wo_staff_fio',
            'staff_confirm', 'wo_answer', 'wo_remark',
            'answer_date', 'create_date', 'full_id',
            'files', 'last_status'
        ]

    def get_last_status(self, obj):
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


class SpecialTechPartSerializer(serializers.ModelSerializer):
    full_id = serializers.CharField(read_only=True)
    tch_part_nach_fio = serializers.CharField(source='tch_part_nach.fio', read_only=True)
    create_user_fio = serializers.CharField(source='create_user_id.fio', read_only=True)
    work_orders = serializers.SerializerMethodField()
    last_status = serializers.SerializerMethodField()

    class Meta:
        model = ProjectGipPart
        fields = [
            'tch_part_code', 'tch_part_no', 'tch_part_name',
            'tch_part_nach', 'tch_part_nach_fio',
            'tch_start_date', 'tch_finish_date',
            'nach_otd_confirm', 'nach_otd_confirm_date',
            'create_date', 'create_user_fio', 'full_id',
            'work_orders', 'last_status'
        ]

    def get_work_orders(self, obj):
        request = self.context.get('request')
        visible_wos = [
            wo for wo in obj.work_orders.all()
            if has_tree_access(request.user, project=obj.fs_part_code.project_code,
                               finance_part=obj.fs_part_code, tech_part=obj, work_order=wo)
        ]
        return SpecialWorkOrderSerializer(visible_wos, many=True, context=self.context).data

    def get_last_status(self, obj):
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


class SpecialFinancePartSerializer(serializers.ModelSerializer):
    tech_parts = serializers.SerializerMethodField()
    last_status = serializers.SerializerMethodField()

    class Meta:
        model = ProjectFinancePart
        fields = '__all__'

    def get_tech_parts(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        parts = obj.gip_parts.all()
        visible_parts = [
            part for part in parts
            if has_tree_access(user, project=obj.project_code, finance_part=obj, tech_part=part)
        ]
        return SpecialTechPartSerializer(visible_parts, many=True, context=self.context).data

    def get_last_status(self, obj):
        try:
            status = ObjectLastStatus.objects.get(full_id=obj.fs_part_code)
            return {
                "latest_action": status.latest_action,
                "latest_phase_type": status.latest_phase_type.name if status.latest_phase_type else None,
                "last_updated": status.last_updated,
                "updated_by": status.updated_by.fio if status.updated_by else None,
            }
        except ObjectLastStatus.DoesNotExist:
            return None


class SpecialProjectSerializer(serializers.ModelSerializer):
    full_id = serializers.SerializerMethodField()
    last_status = serializers.SerializerMethodField()
    finance_parts = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'

    def get_full_id(self, obj):
        return str(obj.project_code)

    def get_last_status(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        parts = ProjectGipPart.objects.filter(fs_part_code__project_code=obj)
        for part in parts:
            if has_tree_access(user, project=obj, finance_part=part.fs_part_code, tech_part=part):
                break
        else:
            return None

        try:
            status = ObjectLastStatus.objects.get(full_id=str(obj.project_code))
            return {
                "latest_action": status.latest_action,
                "latest_phase_type": status.latest_phase_type.name if status.latest_phase_type else None,
                "last_updated": status.last_updated,
                "updated_by": status.updated_by.fio if status.updated_by else None,
            }
        except ObjectLastStatus.DoesNotExist:
            return None

    def get_finance_parts(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        parts = obj.finance_parts.all()
        visible_parts = [
            part for part in parts
            if has_tree_access(user, project=obj, finance_part=part)
        ]
        return SpecialFinancePartSerializer(visible_parts, many=True, context=self.context).data


class SpecialProjectDetailAPIView(generics.RetrieveAPIView):
    queryset = Project.objects.all()
    serializer_class = SpecialProjectSerializer
    lookup_field = 'project_code'

    def get_queryset(self):
        return Project.objects.select_related('create_user')