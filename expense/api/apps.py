from django.apps import AppConfig
from django.db.utils import IntegrityError
from django.core.exceptions import ImproperlyConfigured
from django.db.models.signals import post_migrate

class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self):
        from api.models import Category  # Import model inside ready() to avoid circular imports
        post_migrate.connect(create_core_categories, sender=self)

def create_core_categories(sender, **kwargs):
    """Ensures core categories exist after migrations"""
    from api.models import Category

    core_categories = ["Income", "Expense", "Money", "Debt", "Invest"]

    for category in core_categories:
        try:
            Category.objects.get_or_create(name=category, parent=None)
        except (IntegrityError, ImproperlyConfigured):
            pass  # Ignore errors due to multiple workers or misconfiguration
