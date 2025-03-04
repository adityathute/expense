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
    """Ensures core categories and predefined categories exist after migrations"""
    from api.models import Category

    # Core categories
    CORE_CATEGORIES = [
        ("Income", "Income"),
        ("Expense", "Expense"),
        ("Money", "Money"),
        ("Debt", "Debt"),
        ("Invest", "Invest"),
    ]

    try:
        # Ensure core categories exist
        core_category_objects = {}
        for key, name in CORE_CATEGORIES:
            obj, _ = Category.objects.get_or_create(name=name, core_category=key, parent=None)
            core_category_objects[key] = obj  # Store references

        # # Ensure "Services" exists under "Income"
        # if "Income" in core_category_objects:
        #     Category.objects.get_or_create(
        #         name="Services",
        #         core_category="Income",
        #         category_type="Shop",
        #         parent=core_category_objects["Income"]
        #     )

        # print("✅ Core categories and 'Services' created successfully!")

    except (IntegrityError, ImproperlyConfigured):
        pass  # Ignore errors due to multiple workers or misconfiguration
