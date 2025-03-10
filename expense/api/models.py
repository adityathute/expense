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

class User(models.Model):
    # Basic Details
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)  # ✅ Added DOB

    # Mobile Number (Allow same number for multiple users)
    mobile_number = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        validators=[RegexValidator(regex=r'^\d{10}$', message="Mobile number must be exactly 10 digits")]
    )

    # Additional Fields
    gender = models.CharField(
        max_length=10,
        choices=[("Male", "Male"), ("Female", "Female"), ("Other", "Other")],
        blank=True,
        null=True
    )  # ✅ Optional Gender field

    # Tracking Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class UserID(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="identifications")

    ID_TYPES = [
        ("Aadhaar", "Aadhaar"),
        ("PAN", "PAN Card"),
        ("Voter ID", "Voter ID"),
        ("Driving License", "Driving License"),
        ("Passport", "Passport"),
    ]
    id_type = models.CharField(max_length=20, choices=ID_TYPES, blank=True, null=True)  # ✅ Make optional
    id_number = models.CharField(max_length=20, unique=True, blank=True, null=True)  # ✅ Make optional

    def __str__(self):
        return f"{self.user.name} - {self.id_type}: {self.id_number}" if self.id_number else f"{self.user.name} - No ID"

class Service(models.Model):
    # Basic Service Details
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    
    # Service Category (e.g., ID Cards, Tax Services, Utility Bills)
    category = models.CharField(max_length=100, blank=True, null=True)  

    # Pricing & Charges
    service_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Customer pays

    # Page Tracking (For Printing & Document Services)
    pages_required = models.PositiveIntegerField(default=0)  # If applicable, pages needed for this service

    # Service Status & Additional Info
    estimated_time_seconds = models.PositiveIntegerField(blank=True, null=True)  # Time in seconds (better for DB)
    is_active = models.BooleanField(default=True)  # Mark active/inactive service
    priority_level = models.IntegerField(
        choices=[(1, 'Low'), (2, 'Medium'), (3, 'High')], 
        default=2
    )  # Numeric priority for better sorting

    # Tracking & Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class ServiceRequirement(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE)  # Link to Service
    requirement_name = models.CharField(max_length=255)  # Ex: Aadhaar Card, Birth Certificate

    REQUIREMENT_TYPES = [
        ('Document', 'Document'),
        ('Info', 'Information'),
        ('Verification', 'Verification'),  # OTP, Signature, Biometric
    ]
    requirement_type = models.CharField(max_length=50, choices=REQUIREMENT_TYPES, default='Document')

    is_mandatory = models.BooleanField(default=True)  # If required for service
    additional_details = models.TextField(blank=True, null=True)  # Any extra notes

    def __str__(self):
        return f"{self.service.name} - {self.requirement_name}"

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
