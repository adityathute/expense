"""
URL configuration for expense project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# 📦 Import necessary modules and classes
from account.admin import admin_site # 📝 Import custom admin site
from django.urls import path, include
from . import views

# 📜 Define URL patterns for the account app
urlpatterns = [
    path('admin/', admin_site.urls),
    path('', views.index, name='index'),
    path('auth/', include('account.urls')), # 🔒 URL for account authentication
]