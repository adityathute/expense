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
from django.urls import path, include, re_path
import requests
from . import views
from django.http import HttpResponse

# Function to proxy Next.js frontend requests
def proxy_nextjs(request, path=""):
    nextjs_url = f"http://localhost:3000/{path}"  # Point to Next.js server
    response = requests.get(nextjs_url)

    # Return the Next.js response to Django
    return HttpResponse(response.content, status=response.status_code, content_type=response.headers['Content-Type'])

# 📜 Define URL patterns for the account app
urlpatterns = [
    path('admin/', admin_site.urls),
    path('auth/', include('account.urls')), # 🔒 URL for account authenticatio
    path('', include('api.urls')),
    path('', views.index, name='index'),
    # re_path(r"^(?!api/).*", proxy_nextjs),  # Proxy all non-API routes to Next.js
]

