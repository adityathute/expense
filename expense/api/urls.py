# account/urls.py

# 📦 Import necessary modules and classes
from django.urls import path
from . import views

# 📜 Define URL patterns for the account app
urlpatterns = [
    path('api/categories/', views.category_list, name='category_list'),  # Ensure proper API path
    path("api/categories/<int:category_id>/", views.category_detail, name="category_detail"),
]