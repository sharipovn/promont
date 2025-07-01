from rest_framework import serializers
from .models import StaffUser,Role




    
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

    class Meta:
        model = StaffUser
        fields = ['username', 'fio', 'phone_number', 'password', 'role_id']

    def create(self, validated_data):
        password = validated_data.pop('password')
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
