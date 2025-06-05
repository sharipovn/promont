from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from api.models import Project
from api.special_serializers import SpecialProjectSerializer


class SpecialProjectRetrieveView(RetrieveAPIView):
    queryset = Project.objects.all()
    serializer_class = SpecialProjectSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'project_code'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_object(self):
        project = super().get_object()
        user = self.request.user
        capabilities = set(user.get_capability_names())

        # ✅ Full access: creator, project_gip, or key capability holders
        if (
            project.create_user == user or
            project.project_gip == user or
            'IS_FIN_DIR' in capabilities or
            'IS_TECH_DIR' in capabilities
        ):
            return project

        # ✅ Financier with IS_FINANCIER capability
        if project.financier == user and 'IS_FINANCIER' in capabilities:
            return project

        # ✅ NACH_OTDEL with relevant tech parts
        if 'IS_NACH_OTDEL' in capabilities and project.finance_parts.filter(
            gip_parts__tch_part_nach=user
        ).exists():
            return project

        # ✅ STAFF with linked work orders
        if 'IS_STAFF' in capabilities and project.finance_parts.filter(
            gip_parts__work_orders__wo_staff=user
        ).exists():
            return project

        raise PermissionDenied("You do not have permission to view this project.")
