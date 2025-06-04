# views.py
from rest_framework.generics import RetrieveAPIView
from api.models import Project
from .special_serializers import SpecialProjectSerializer

class SpecialProjectDetailAPIView(RetrieveAPIView):
    queryset = Project.objects.all()
    serializer_class = SpecialProjectSerializer
    lookup_field = 'project_code'

    def get_queryset(self):
        return Project.objects.select_related('create_user')  # optimize


