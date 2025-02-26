# fixtures.py

from api.models import Category

core_categories = ["Income", "Expense", "Money", "Debt", "Invest"]

for category in core_categories:
    if not Category.objects.filter(name=category, parent=None).exists():
        Category.objects.create(name=category, core_category=category)
