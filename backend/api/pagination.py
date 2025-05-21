# pagination.py
from rest_framework.pagination import PageNumberPagination


class ProjectsPagination(PageNumberPagination):
    page_size = 10  # Har sahifada 10 ta project
    page_size_query_param = 'page_size'  # Klient tomonidan o‘zgaruvchi page_size
    max_page_size = 10  # Maksimal ruxsat etilgan hajm



class ProjectsFiancierConfirmPagination(PageNumberPagination):
    page_size = 8  # Har sahifada 10 ta project
    page_size_query_param = 'page_size'  # Klient tomonidan o‘zgaruvchi page_size
    max_page_size = 8  # Maksimal ruxsat etilgan hajm
    
    

class PartnersPagination(PageNumberPagination):
    page_size = 12  # Har sahifada 10 ta project
    page_size_query_param = 'page_size'  # Klient tomonidan o‘zgaruvchi page_size
    max_page_size = 12  # Maksimal ruxsat etilgan hajm