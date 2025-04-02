from django.db import models
from django.conf import settings
from decouple import config
# ---------------------- CATEGORY RELATED MODEL ---------------------- #

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

# ---------------------- USER RELATED MODELS ---------------------- #

class User(models.Model):
    USER_TYPES = [
        ("Customer", "Customer"),
        ("Staff", "Staff"),
        ("Family", "Family"),
        ("Friend", "Friend"),
        ("Agent", "Agent"),
        ("Client", "Client"),
    ]

    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
    ]

    # Basic Details
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    mobile_number = models.CharField(max_length=10, blank=True, null=True)

    # Multi-select User Type (Stored as JSON for MySQL/SQLite)
    user_type = models.JSONField(default=list)  # Example: ["Customer", "Agent"]

    # Gender Field
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)

    # Tracking Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.user_type:
            self.user_type = ["Customer"]  # Default if not selected
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class UserID(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="identifications")

    ID_TYPES = [
        ("Aadhaar", "Aadhaar"),
        ("Pancard", "Pancard"),
        ("Voter ID", "Voter ID"),
        ("Driving License", "Driving License"),
        ("Passport", "Passport"),
        ("Ration Card", "Ration Card"),
        ("BOCW", "BOCW"),
        ("Aapaar ID", "Aapaar ID"),
        ("ABHA ID", "ABHA ID"),
        ("Other", "Other"),  # ✅ Added Other
    ]
    id_type = models.CharField(max_length=20, choices=ID_TYPES, blank=True, null=True)  # ✅ Updated choices
    id_number = models.CharField(max_length=20, unique=True, blank=True, null=True)  # ✅ Optional ID Number
    other_doc_name = models.CharField(max_length=255, blank=True, null=True)  # ✅ Added for "Other"

    def __str__(self):
        return f"{self.user.name} - {self.id_type}: {self.id_number}" if self.id_number else f"{self.user.name} - No ID"

# ---------------------- SERVICE RELATED MODELS ---------------------- #

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

# ---------------------- USER SERVICE RELATED MODELS ---------------------- #

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
    
# ---------------------- UID SERVICE RELATED MODELS ---------------------- #

# Fetch the enrollment prefix from the environment
ENROLLMENT_PREFIX = config("ENROLLMENT_PREFIX", default="085528018")  # 9-digit prefix

class UIDTempEntry(models.Model):
    ENTRY_TYPE_CHOICES = [
        ("new", "New"),
        ("update", "Update"),
    ]

    UID_TYPE_CHOICES = [
        ("offline", "Offline"),
        ("online", "Online"),
        ("ucl", "UCL"),
    ]

    UPDATE_TYPE_CHOICES = [
        ("new_adhar", "New Adhar"),
        ("mobile_change", "Mobile Number Change"),
        ("biometric_change", "Biometric Change"),
        ("name_change", "Name Change"),
        ("address_change", "Address Change"),
        ("dob_change", "Date of Birth Change"),
    ]

    full_name = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=10)
    aadhaar_number = models.CharField(
        max_length=12, blank=True, null=True
    )  # Aadhaar number (optional)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    entry_type = models.CharField(
        max_length=10, choices=ENTRY_TYPE_CHOICES, default="new"
    )  # Indicates whether it's a new or updated entry
    uid_type = models.CharField(
        max_length=15, choices=UID_TYPE_CHOICES, default="offline"
    )  # UID Type (Offline UCL, Online, Offline [Default])
    update_type = models.CharField(
        max_length=20, choices=UPDATE_TYPE_CHOICES, blank=True, null=True
    )  # Dropdown menu for selecting update type

    def __str__(self):
        return f"{self.full_name} - {self.aadhaar_number or 'No Aadhaar'} - Type: {self.entry_type} - Update: {self.get_update_type_display() or 'N/A'}"


class UIDEntry(models.Model):
    ENTRY_TYPE_CHOICES = [
        ("new", "New"),
        ("update", "Update"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("rejected", "Rejected"),
    ]

    UID_TYPE_CHOICES = [
        ("offline", "Offline"),
        ("online", "Online"),
        ("ucl", "UCL"),
    ]

    UPDATE_TYPE_CHOICES = [
        ("new_adhar", "New Adhar"),
        ("mobile_change", "Mobile Number"),
        ("biometric_change", "Biometric Change"),
        ("name_change", "Name"),
        ("address_change", "Address Change"),
        ("dob_change", "Date of Birth Change"),
    ]

    PAYMENT_TYPE_CHOICES = [
        ("cash", "Cash"),
        ("online", "Online"),
    ]

    full_name = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=10)
    aadhaar_number = models.CharField(
        max_length=12, blank=True, null=True
    )  # Aadhaar number (optional)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    entry_type = models.CharField(
        max_length=10, choices=ENTRY_TYPE_CHOICES, default="update"
    )  # Indicates whether it's a new or updated entry
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default="pending"
    )  # Pending, Completed, or Rejected
    uid_type = models.CharField(
        max_length=15, choices=UID_TYPE_CHOICES, default="offline"
    )  # UID Type (Offline UCL, Online, Offline [Default])
    entry_time = models.CharField(max_length=6, blank=True, null=True)  # 6-digit format HHMMSS (Manual entry)
    enrollment_suffix = models.CharField(max_length=5, blank=True, null=True)  # Only last 5 digits change
    update_type = models.CharField(max_length=20, choices=UPDATE_TYPE_CHOICES, blank=True, null=True)  # Dropdown menu for selecting update type
    # Pricing & Charges
    service_charge = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)  # Customer pays
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, blank=True, null=True)  # Dropdown menu for selecting update type

    @property
    def full_enrollment_number(self):
        """Generate full 14-digit enrollment number using ENV prefix"""
        if self.enrollment_suffix:
            return f"{ENROLLMENT_PREFIX}{self.enrollment_suffix}"
        return None  # No enrollment number assigned yet

    def __str__(self):
        return f"{self.full_name} - {self.aadhaar_number or 'No Aadhaar'} - Type: {self.entry_type} - Update: {self.get_update_type_display() or 'N/A'}"
