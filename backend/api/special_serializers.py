from rest_framework import serializers
from api.models import Project, ProjectFinancePart, ProjectGipPart, WorkOrder, WorkOrderFile


class WorkOrderFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkOrderFile
        fields = ['id', 'original_name', 'file']


class WorkOrderSerializer(serializers.ModelSerializer):
    files = WorkOrderFileSerializer(many=True, read_only=True)

    class Meta:
        model = WorkOrder
        fields = [
            'wo_id', 'wo_no', 'wo_name', 'wo_start_date', 'wo_finish_date',
            'wo_staff', 'staff_confirm', 'files'
        ]


class TechnicalPartSerializer(serializers.ModelSerializer):
    work_orders = serializers.SerializerMethodField()

    class Meta:
        model = ProjectGipPart
        fields = [
            'tch_part_code', 'tch_part_no', 'tch_part_name',
            'tch_part_nach', 'tch_start_date', 'tch_finish_date',
            'work_orders'
        ]

    def get_work_orders(self, obj):
        user = self.context['request'].user
        caps = set(user.get_capability_names())

        if caps & {'IS_TECH_DIR', 'IS_FIN_DIR', 'IS_FINANCIER', 'IS_GIP'}:
            return WorkOrderSerializer(obj.work_orders.all(), many=True).data

        if 'IS_NACH_OTDEL' in caps and obj.tch_part_nach == user:
            return WorkOrderSerializer(obj.work_orders.all(), many=True).data

        if 'IS_STAFF' in caps:
            return WorkOrderSerializer(obj.work_orders.filter(wo_staff=user), many=True).data

        return []


class FinancePartSerializer(serializers.ModelSerializer):
    gip_parts = serializers.SerializerMethodField()

    class Meta:
        model = ProjectFinancePart
        fields = [
            'fs_part_code', 'fs_part_no', 'fs_part_name',
            'fs_part_price', 'fs_start_date', 'fs_finish_date',
            'gip_parts'
        ]

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

    class Meta:
        model = Project
        fields = [
            'project_code', 'project_name', 'start_date', 'end_date', 'total_price',
            'create_user', 'financier', 'project_gip', 'finance_parts'
        ]

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
