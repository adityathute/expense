from django.db import models

class Category(models.Model):
    CATEGORY_TYPES = [
        ("Home", "Home"),
        ("Shop", "Shop"),
    ]
    CORE_CATEGORIES = [
        ("Income", "Income"),
        ("Expense", "Expense"),
        ("Money", "Money"),
        ("Debt", "Debt"),
        ("Invest", "Invest"),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="subcategories")
    core_category = models.CharField(max_length=20, choices=CORE_CATEGORIES, null=True, blank=True)
    category_type = models.CharField(max_length=10, choices=CATEGORY_TYPES, blank=True, null=True)

    def __str__(self):
        return self.name
