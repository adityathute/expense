from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.db import connection
from django.core.exceptions import ImproperlyConfigured
from .choices import CORE_CATEGORIES

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        post_migrate.connect(create_core_categories, sender=self)

def create_core_categories(sender, **kwargs):
    from .models import Category
    from django.db import connection

    table_name = Category._meta.db_table
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES LIKE %s", [table_name])
        if not cursor.fetchone():
            return

    for key, name in CORE_CATEGORIES:
        Category.objects.get_or_create(name=name, core_category=key, parent=None)