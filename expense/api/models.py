from django.db import models
from django.core.validators import RegexValidator
import random

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

    name = models.CharField(max_length=255, unique=True)
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
        ordering = ["core_category", "name"]

import random
from django.db import models
from django.core.validators import RegexValidator

class User(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)  
    email = models.EmailField(blank=True, null=True)  
    mobile_number = models.CharField(
        max_length=10,
        blank=True,  # ✅ Allow blank user_id
        null=True,   # ✅ Allow NULL value in DB
        unique=True,
        validators=[RegexValidator(regex=r'^\d{10}$', message="Mobile number must be exactly 10 digits")]
    )
    user_id = models.CharField(
        max_length=12,
        blank=True,  # ✅ Allow blank user_id
        null=True,   # ✅ Allow NULL value in DB
        unique=True,
        validators=[RegexValidator(regex=r'^\d{12}$', message="User ID must be exactly 12 digits if provided")]
    )
    total_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Service(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    agent_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    service_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    required_documents = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_fees(self):
        return self.agent_fee + self.service_charge  # ✅ Correctly calculate total fees

    def __str__(self):
        return self.name

class UserService(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="services_used")
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    acknowledgment_number = models.CharField(max_length=255, unique=True)
    tracking_number = models.CharField(max_length=255, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.name} - {self.service.name}"
