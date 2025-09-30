from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'accounts', views.AccountViewSet, basename='account')
router.register(r'services', views.ServiceViewSet, basename='service')
router.register(r'documents', views.DocumentViewSet, basename='document')
router.register(r'service-document-requirements', views.ServiceDocumentRequirementViewSet, basename='service-document-requirement')  # ✅ New line
router.register(r'supporting-documents', views.SupportingDocumentViewSet)
router.register(r'service-supporting-documents', views.ServiceSupportingDocumentViewSet, basename='service-supporting-document')

urlpatterns = [
    path('api/', include(router.urls)),

    # Categories (unchanged, assuming custom views)
    path('api/categories/', views.category_list, name='category_list'),
    path('api/categories/<int:category_id>/', views.category_detail, name='category_detail'),
    path('api/categories/<int:category_id>/restore/', views.category_restore, name='category-restore'),

    # Users
    path('api/users/', views.UserListCreateView.as_view(), name='user-list-create'),
    path('api/users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('api/documents/create/', views.create_document, name='create_document'),
    path('api/users/<int:user_id>/restore/', views.user_restore, name='user-restore'),
    path('api/users/<int:user_id>/hard-delete/', views.user_hard_delete, name='user-hard-delete'),
    
    # Accounts
    path('api/accounts/', views.AccountListView.as_view(), name='account-list'),
    path('api/accounts/<int:account_id>/restore/', views.account_restore, name='account-restore'),
    path('api/accounts/<int:account_id>/hard-delete/', views.account_hard_delete, name='account-hard-delete'),

    # PDF Generation
    path('api/generate-pdf/', views.generate_pdf, name='generate_pdf'),
]
