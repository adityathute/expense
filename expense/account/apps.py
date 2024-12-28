# account/apps.py

# 📦 Import necessary modules
from django.apps import AppConfig

# Define configuration for the Account app
class AccountConfig(AppConfig):
    # Define the default auto field
    default_auto_field = 'django.db.models.BigAutoField'
    # Define the name of the app
    name = 'account'
