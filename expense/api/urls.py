from django.urls import path
from . import views

urlpatterns = [
    path('api/categories/', views.category_list, name='category_list'),
    path("api/categories/<int:category_id>/", views.category_detail, name="category_detail"),
]
