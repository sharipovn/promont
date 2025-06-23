from rest_framework.generics import RetrieveAPIView,ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from api.models import Project,Message
from api.special_serializers import SpecialProjectSerializer,MessageSerializer



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





class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        content = request.data.get('content')
        full_id = request.data.get('full_id')
        path_type = request.data.get('path_type')

        if not all([content, full_id, path_type]):
            return Response({"detail": "Missing fields."}, status=status.HTTP_400_BAD_REQUEST)

        msg = Message.objects.create(
            content=content,
            full_id=full_id,
            path_type=path_type,
            sender=request.user
        )
        return Response({"detail": "Message sent.", "message_id": msg.message_id}, status=status.HTTP_201_CREATED)


class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        full_id = request.query_params.get('full_id')
        path_type = request.query_params.get('path_type')

        if not full_id or not path_type:
            return Response({"detail": "Missing parameters."}, status=status.HTTP_400_BAD_REQUEST)

        messages = (
            Message.objects
            .filter(full_id=full_id, path_type=path_type)
            .select_related('sender')
            .order_by('create_time')
        )

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)






