# permissions.py

from rest_framework.permissions import BasePermission

def HasCapabilityPermission(capability_name):
    class _HasCapabilityPermission(BasePermission):
        def has_permission(self, request, view):
            return (
                request.user and
                request.user.is_authenticated and
                hasattr(request.user, 'get_capability_names') and
                capability_name in request.user.get_capability_names()
            )
    return _HasCapabilityPermission
