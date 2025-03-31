from django.urls import path
from . import views

urlpatterns = [
    path('api/categories/', views.category_list, name='category_list'),
    path("api/categories/<int:category_id>/", views.category_detail, name="category_detail"),
    path('api/services/', views.ServiceListCreateView.as_view(), name='service-list-create'),
    path('api/services/<int:pk>/', views.ServiceDetailView.as_view(), name='service-detail'),
    path('api/users/', views.UserListCreateView.as_view(), name='user-list-create'),
    path('api/users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path("api/user-services/", views.UserServiceListCreateView.as_view(), name="user-service-list-create"),
    path("api/user-services/<int:pk>/", views.UserServiceDetailView.as_view(), name="user-service-detail"),
    path("api/uid-temp-entries/create/", views.UIDTempEntryCreateView.as_view(), name="uid-temp-create"),
    path("api/uid-temp-entries/", views.UIDTempEntryListView.as_view(), name="uid-temp-list"),
    path("api/uid-entries/", views.UIDEntryListView.as_view(), name="uid-entry-list"),
    path("api/uid-entries/create/", views.UIDEntryCreateView.as_view(), name="uid-entry-create"),
    path("api/uid-temp-entries/<int:pk>/delete/", views.TempEntryDeleteView.as_view(), name="uid-temp-delete"),
]
