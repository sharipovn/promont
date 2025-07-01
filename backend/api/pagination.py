# pagination.py
from rest_framework.pagination import PageNumberPagination


class ProjectsPagination(PageNumberPagination):
    page_size = 10  # Har sahifada 10 ta project
    page_size_query_param = 'page_size'  # Klient tomonidan o‘zgaruvchi page_size
    max_page_size = 10  # Maksimal ruxsat etilgan hajm



class ProjectListCreatePagination(PageNumberPagination):
    page_size = 13  # Har sahifada 10 ta project
    page_size_query_param = 'page_size'  # Klient tomonidan o‘zgaruvchi page_size
    max_page_size = 13  # Maksimal ruxsat etilgan hajm


class ProjectsFiancierConfirmPagination(PageNumberPagination):
    page_size = 8  # Har sahifada 10 ta project
    page_size_query_param = 'page_size'  # Klient tomonidan o‘zgaruvchi page_size
    max_page_size = 8  # Maksimal ruxsat etilgan hajm
    
    

class PartnersPagination(PageNumberPagination):
    page_size = 12  # Har sahifada 10 ta project
    page_size_query_param = 'page_size'  # Klient tomonidan o‘zgaruvchi page_size
    max_page_size = 12  # Maksimal ruxsat etilgan hajm
    

class TranslationsPagination(PageNumberPagination):
    page_size = 15  # Har sahifada 10 ta project
    page_size_query_param = 'page_size'  # Klient tomonidan o‘zgaruvchi page_size
    max_page_size = 15  # Maksimal ruxsat etilgan hajm
    
    
class GipConfirmPagination(PageNumberPagination):
    page_size = 10  # Har sahifada 10 ta project
    page_size_query_param = 'page_size'  # Klient tomonidan o‘zgaruvchi page_size
    max_page_size = 10  # Maksimal ruxsat etilgan hajm
    
    
class ProjectGipPartPagination(PageNumberPagination):
    page_size = 10  # Har sahifada 10 ta project
    page_size_query_param = 'page_size'  # Klient tomonidan o‘zgaruvchi page_size
    max_page_size = 10  # Maksimal ruxsat etilgan hajm
    
    
    
class CompleteWorkOrderPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 10
    
    
class NotificationsPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size =10
    
    
class StaffManagementPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size =15
    
class DepartmentPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = 'page_size'
    max_page_size =8  
    



class AdminUserPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 15  
    
