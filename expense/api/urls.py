from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'accounts', views.AccountViewSet, basename='account')

urlpatterns = [
    path('api/', include(router.urls)),
    
    # Keep your existing paths:
    path('api/categories/', views.category_list, name='category_list'),
    path("api/categories/<int:category_id>/", views.category_detail, name="category_detail"),
    path('api/services/', views.ServiceListCreateView.as_view(), name='service-list-create'),
    path('api/services/<int:pk>/', views.ServiceDetailView.as_view(), name='service-detail'),
    path('api/users/', views.UserListCreateView.as_view(), name='user-list-create'),
    path('api/users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('api/accounts/', views.AccountListView.as_view(), name='account-list'),
    path("api/generate-pdf/", views.generate_pdf, name="generate_pdf"),
]
