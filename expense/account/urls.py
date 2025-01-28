# account/urls.py

# 📦 Import necessary modules and classes
from django.urls import path
from . import views

# 📜 Define URL patterns for the account app
urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('authorize/', views.authorize_view, name='authorize'),
    path('logout/', views.logout_view, name='logout'),
    path('check/', views.check_login, name='check_login'),
]