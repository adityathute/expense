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

    name = models.CharField(max_length=255, unique=True)  # Prevent duplicate category names
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="subcategories"
    )
    core_category = models.CharField(
        max_length=20, choices=CORE_CATEGORIES, null=True, blank=True
    )
    category_type = models.CharField(
        max_length=10, choices=CATEGORY_TYPES, blank=True, null=True
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["core_category", "name"]  # Sort categories alphabetically within each core category

class Service(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class User(models.Model):
    full_name = models.CharField(max_length=255)
    address = models.TextField()
    mobile_number = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    total_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    @property
    def remaining_amount(self):
        return self.total_charge - self.paid_charge

    def __str__(self):
        return self.full_name

class Service(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.name

class UserService(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="services_used")
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    acknowledgment_number = models.CharField(max_length=255, unique=True)
    tracking_number = models.CharField(max_length=255, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.user.full_name} - {self.service.name}"
