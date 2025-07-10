from rest_framework import serializers
from .models import StaffUser,Role,Project,Currency,Partner
from django.utils.timezone import localtime
from django.utils.dateparse import parse_datetime

def format_datetime(value):
    print('value:',type(value))
    print('value:',value)
    if not value:
        return '-'
    try:
        if isinstance(value, str):
            value = parse_datetime(value)
        if value is not None:
            return localtime(value).strftime('%d.%m.%Y %H:%M')
        return '-'
    except Exception:
        return str(value)

def format_date(value):
    if not value:
        return '-'
    try:
        if isinstance(value, str):
            value = parse_datetime(value)
        return value.strftime('%d.%m.%Y')
    except Exception:
        return str(value)



    
class AdminRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['role_id', 'role_name']
        
        


class AdminUserListSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.role_name', read_only=True)
    create_user_fio = serializers.CharField(source='create_user.fio', read_only=True)

    class Meta:
        model = StaffUser
        fields = [
            'user_id',
            'username',
            'fio',
            'phone_number',
            'is_active',
            'is_staff',
            'is_superuser',
            'role_name',
            'create_user_fio',
            'create_time',
            'update_time',
            'role_id',
        ]
        

class StaffUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = StaffUser
        fields = ['username', 'fio', 'phone_number', 'password', 'role_id']

    def create(self, validated_data):
        password = validated_data.pop('password')
        role_id = validated_data.pop('role_id', None)

        if role_id:
            try:
                validated_data['role'] = Role.objects.get(pk=role_id)
            except Role.DoesNotExist:
                raise serializers.ValidationError({'role_id': 'Invalid role_id'})

        user = StaffUser.objects.create_user(password=password, **validated_data)
        return user



class AdminUserUpdateSerializer(serializers.ModelSerializer):
    role_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = StaffUser
        fields = ['fio', 'phone_number', 'role_id']

    def update(self, instance, validated_data):
        # Explicitly handle role_id: if not in data, set to None
        if 'role_id' not in self.initial_data:
            instance.role = None
        else:
            role_id = validated_data.get('role_id')
            instance.role_id = role_id

        instance.fio = validated_data.get('fio', instance.fio)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)

        instance.save()
        return instance

    
class AdminSetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def save(self, user: StaffUser):
        user.set_password(self.validated_data['password'])
        user.save(update_fields=['password'])
        return user





class ProjectLogSerializer(serializers.ModelSerializer):
    project_id = serializers.IntegerField(source='project_code', read_only=True)
    project_name = serializers.CharField(read_only=True)
    changed_by = serializers.SerializerMethodField()
    field = serializers.SerializerMethodField()
    old_value = serializers.SerializerMethodField()
    new_value = serializers.SerializerMethodField()

    class Meta:
        model = Project.history.model
        fields = [
            'history_id',
            'project_id',
            'project_name',
            'history_type',
            'changed_by',
            'history_date',
            'field',
            'old_value',
            'new_value',
        ]

    def get_changed_by(self, obj):
        return obj.history_user_display or (
            getattr(obj.history_user, 'fio', None) if obj.history_user else None
        )

    def _get_diff(self, obj):
        cache_key = f'_diff_cache_{obj.history_id}'
        if cache_key in self.context:
            return self.context[cache_key]

        prev = getattr(obj, 'prev_record', None)
        if not prev:
            try:
                prev = obj.get_previous_by_history_date()
            except Exception:
                self.context[cache_key] = []
                return []

        try:
            diff = obj.diff_against(prev)
        except Exception:
            self.context[cache_key] = []
            return []

        changes = []
        fk_snapshot_map = {
            'currency': 'currency_name',
            'partner': 'partner_name',
            'financier': 'financier_name',
        }


        for change in diff.changes:
            field_name = change.field
            # print(f"[AUDIT] RAW FIELD: field_name='{field_name}' old='{change.old}' new='{change.new}'")

            if field_name in fk_snapshot_map:
                snapshot_field = fk_snapshot_map[field_name]
                old_value = getattr(prev, snapshot_field, str(change.old)) or '-'
                new_value = getattr(obj, snapshot_field, str(change.new)) or '-'
                # print(f"[AUDIT FIXED] FK FIELD: {field_name=} old='{old_value}' new='{new_value}'")
                changes.append({
                    'field': field_name,
                    'old': old_value,
                    'new': new_value,
                })
            else:
                changes.append({
                    'field': field_name,
                    'old': str(change.old) if change.old is not None else '-',
                    'new': str(change.new) if change.new is not None else '-',
                })




        self.context[cache_key] = changes
        return changes

    def get_field(self, obj):
        changes = self._get_diff(obj)
        return changes[0]['field'] if changes else '-'

    def get_old_value(self, obj):
        changes = self._get_diff(obj)
        return changes[0]['old'] if changes else '-'

    def get_new_value(self, obj):
        changes = self._get_diff(obj)
        return changes[0]['new'] if changes else '-'




class ProjectSnapshotSerializer(serializers.ModelSerializer):
    changed_by = serializers.CharField(source='history_user_display')

    class Meta:
        model = Project.history.model
        fields = [
            'project_code',            # ✅ use this instead of project_id
            'project_name',
            'contract_number',
            'total_price',
            'currency_name',
            'start_date',
            'end_date',
            'financier_name',
            'financier_confirm',
            'financier_confirm_date',
            'project_gip_id',
            'project_gip_name',
            'gip_confirm',
            'gip_confirm_date',
            'partner_name',
            'create_username',
            'create_date',
            'update_date',
            'changed_by',
            'history_date',
        ]



class UserLogSerializer(serializers.ModelSerializer):
    changed_by = serializers.SerializerMethodField()
    role_name = serializers.CharField(source='role.role_name', read_only=True)
    position_name = serializers.CharField(source='position.position_name', read_only=True)
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    create_username = serializers.SerializerMethodField()
    field = serializers.SerializerMethodField()
    old_value = serializers.SerializerMethodField()
    new_value = serializers.SerializerMethodField()

    class Meta:
        model = StaffUser.history.model
        fields = [
            'history_id',
            'username',
            'fio',
            'role_name',
            'position_name',
            'department_name',
            'create_username',
            'history_type',
            'changed_by',
            'history_date',
            'field',
            'old_value',
            'new_value',
        ]

    def get_changed_by(self, obj):
        return obj.history_user_display or (
            getattr(obj.history_user, 'fio', None) if obj.history_user else None
        )

    def get_create_username(self, obj):
        return getattr(obj.create_user, 'username', None)

    def _get_diff(self, obj):
        cache_key = f'_diff_cache_{obj.history_id}'
        if cache_key in self.context:
            return self.context[cache_key]

        prev = getattr(obj, 'prev_record', None)
        if not prev:
            try:
                prev = obj.get_previous_by_history_date()
            except Exception:
                self.context[cache_key] = []
                return []

        try:
            diff = obj.diff_against(prev)
        except Exception:
            self.context[cache_key] = []
            return []

        changes = []
        fk_snapshot_map = {
            'role': 'role_name',
            'position': 'position_name',
            'department': 'department_name',
        }
        datetime_fields = {
            'create_time', 'update_time', 'last_login_time_fail',
            'on_vocation_update', 'on_business_trip_update', 'on_medical_leave_update','last_login'
        }
        date_only_fields = {
            'on_vocation_start', 'on_vocation_end',
            'on_business_trip_start', 'on_business_trip_end',
            'on_medical_leave_start', 'on_medical_leave_end',
        }
        
        for change in diff.changes:
            field_name = change.field
            
            if field_name in fk_snapshot_map:
                snapshot_field = fk_snapshot_map[field_name]
                old_value = getattr(prev, snapshot_field, str(change.old)) or '-'
                new_value = getattr(obj, snapshot_field, str(change.new)) or '-'
                changes.append({
                    'field': field_name,
                    'old': old_value,
                    'new': new_value,
                })

            elif field_name in datetime_fields:
                changes.append({
                    'field': field_name,
                    'old': format_datetime(change.old),
                    'new': format_datetime(change.new),
                })

            elif field_name in date_only_fields:
                changes.append({
                    'field': field_name,
                    'old': format_date(change.old),
                    'new': format_date(change.new),
                })

            else:
                changes.append({
                    'field': field_name,
                    'old': str(change.old) if change.old is not None else '-',
                    'new': str(change.new) if change.new is not None else '-',
                })

        self.context[cache_key] = changes
        return changes

    def get_field(self, obj):
        changes = self._get_diff(obj)
        return changes[0]['field'] if changes else '-'

    def get_old_value(self, obj):
        changes = self._get_diff(obj)
        return changes[0]['old'] if changes else '-'

    def get_new_value(self, obj):
        changes = self._get_diff(obj)
        return changes[0]['new'] if changes else '-'



        
class UserSnapshotSerializer(serializers.ModelSerializer):
    changed_by = serializers.CharField(source='history_user_display', default='-')
    role_name = serializers.CharField(source='role.role_name', default='-', read_only=True)
    department_name = serializers.CharField(source='department.department_name', default='-', read_only=True)
    position_name = serializers.CharField(source='position.position_name', default='-', read_only=True)
    create_username = serializers.CharField(source='create_user.username', default='-', read_only=True)

    class Meta:
        model = StaffUser.history.model
        fields = [
            'user_id',
            'username',
            'fio',
            'phone_number',
            'role_name',
            'position_name',
            'department_name',
            'is_active',
            'is_superuser',
            'create_username',
            'create_time',
            'update_time',
            'changed_by',
            'history_date',
        ]