from django.db import models
from django.conf import settings
from decouple import config
from django.core.exceptions import ValidationError
from .choices import CATEGORY_TYPES, CORE_CATEGORIES, GENDER_CHOICES, ID_TYPES, DOCUMENT_TYPE_CHOICES, ENTRY_TYPE_CHOICES, UID_TYPE_CHOICES,  UPDATE_TYPE_CHOICES, ENTRY_TYPE_CHOICES, STATUS_CHOICES, UID_TYPE_CHOICES, UPDATE_TYPE_CHOICES, PAYMENT_TYPE_CHOICES, ACCOUNT_TYPE_CHOICES, CATEGORY_CHOICES

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

    name = models.CharField(max_length=255)
    old_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    old_email = models.EmailField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    old_date_of_birth = models.DateField(blank=True, null=True)
    mobile_number = models.CharField(max_length=10, blank=True, null=True)
    user_type = models.JSONField(default=list)  # Example: ["Customer", "Agent"]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    is_deleted = models.BooleanField(default=False, verbose_name="Is Deleted")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.user_type:
            self.user_type = ["Customer"] 
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="address")
    house_number = models.CharField(max_length=10, blank=True, null=True)
    street = models.CharField(max_length=255, blank=True, null=True)
    landmark = models.CharField(max_length=510, blank=True, null=True)
    area = models.CharField(max_length=510, blank=True, null=True)
    village = models.CharField(max_length=255, blank=True, null=True)
    post_office = models.CharField(max_length=255, blank=True, null=True)
    sub_dist = models.CharField(max_length=255, blank=True, null=True)
    district = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    pincode = models.CharField(max_length=6, blank=True, null=True)
    is_deleted = models.BooleanField(default=False, verbose_name="Is Deleted")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.name}"

class UserID(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="identifications")
    id_type = models.CharField(max_length=20, choices=ID_TYPES, blank=True, null=True)
    id_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    other_doc_name = models.CharField(max_length=255, blank=True, null=True)
    is_deleted = models.BooleanField(default=False, verbose_name="Is Deleted")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.name} - {self.id_type}: {self.id_number}" if self.id_number else f"{self.user.name} - No ID"

# ---------------------- CATEGORY RELATED MODEL ---------------------- #

class Category(models.Model):
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
    is_deleted = models.BooleanField(default=False, verbose_name="Is Deleted")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["core_category", "name"]

# ---------------------- SERVICE RELATED MODELS ---------------------- #
class DocumentCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Service(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    service_fee = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    service_charge = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    other_charge = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    pages_required = models.PositiveIntegerField(default=0)
    estimated_time_seconds = models.PositiveIntegerField(blank=True, null=True)
    required_time_hours = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    required_documents = models.ManyToManyField(
        "Document",
        through="ServiceDocumentRequirement",
        related_name="services"
    )

    def __str__(self):
        return self.name

class ServiceDocumentRequirement(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    document = models.ForeignKey("Document", on_delete=models.CASCADE)

    is_mandatory = models.BooleanField(default=False)
    
    REQUIREMENT_TYPE_CHOICES = [
        ('original', 'Original'),
        ('xerox', 'Xerox'),
        ('both', 'Both'),
    ]
    requirement_type = models.CharField(
        max_length=10,
        choices=REQUIREMENT_TYPE_CHOICES,
        default='xerox'
    )

    class Meta:
        unique_together = ('service', 'document')  # One doc per service

    def __str__(self):
        return f"{self.document.name} for {self.service.name} [{self.get_requirement_type_display()}]"

class Document(models.Model):
    name = models.CharField("Document Name", max_length=255)
    document_categories = models.ManyToManyField("DocumentCategory", blank=True)
    additional_details = models.TextField("Additional Details", blank=True, null=True)
    is_deleted = models.BooleanField("Is Deleted", default=False)
    created_at = models.DateTimeField("Created At", auto_now_add=True)
    updated_at = models.DateTimeField("Updated At", auto_now=True)

    def __str__(self):
        return self.name

class ServiceLink(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='links')
    label = models.CharField(max_length=100)
    url = models.URLField()

    def __str__(self):
        return f"{self.label} - {self.service.name}"

# ---------------------- ACCOUNTS RELATED MODELS ---------------------- #

class ActiveAccountManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

class Account(models.Model):
    account_holder_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Account Holder's Name")
    account_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="Account Number")
    account_mode = models.CharField(choices=[('Cash', 'Cash'), ('Online', 'Online')],  max_length=25)
    bank_service_name = models.CharField(max_length=255, blank=True, null=True)
    account_type = models.CharField(max_length=25, blank=True, null=True, choices=ACCOUNT_TYPE_CHOICES)
    ifsc_code = models.CharField(max_length=20, blank=True, null=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    issue_date = models.DateTimeField(null=True, blank=True)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, verbose_name="Category")
    is_active = models.BooleanField(default=True)
    objects = models.Manager()
    active_objects = ActiveAccountManager()
    is_deleted = models.BooleanField(default=False, verbose_name="Is Deleted")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.account_mode != "Cash":
            if not self.account_number:
                raise ValidationError("Account number is required for non-cash accounts.")
            if Account.objects.exclude(pk=self.pk).filter(account_number=self.account_number).exists():
                raise ValidationError("Account number must be unique.")
        else:
            self.account_number = None

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.account_holder_name} ({self.bank_service_name}) - {self.account_number}"

    class Meta:
        verbose_name = 'Account'
        verbose_name_plural = 'Accounts'

        indexes = [
            models.Index(fields=['account_number']),
            models.Index(fields=['account_holder_name']),
        ]

# ---------------------- TRANSACTION RELATED MODELS ---------------------- #
class Transactions(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=CORE_CATEGORIES)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_TYPE_CHOICES)
    description = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

# ---------------------- ENTRY RELATED MODELS ---------------------- #

# Fetch the enrollment prefix from the environment
ENROLLMENT_PREFIX = config("ENROLLMENT_PREFIX", default="085528018")

class ServiceTempEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    service_type = models.CharField(max_length=20, choices=UPDATE_TYPE_CHOICES, blank=True, null=True)
    mobile_number = models.CharField(max_length=10)
    update_type = models.CharField(max_length=15, choices=UID_TYPE_CHOICES, default="offline")
    entry_type = models.CharField(max_length=10, choices=ENTRY_TYPE_CHOICES, default="update")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user}"

class ServiceEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    service_type = models.CharField(max_length=20, choices=UPDATE_TYPE_CHOICES, blank=True, null=True)
    mobile_number = models.CharField(max_length=10)
    is_miscellaneous = models.BooleanField(default=False, help_text="True if this is a non-standard or walk-in transaction.")
    update_type = models.CharField(max_length=15, choices=UID_TYPE_CHOICES, default="offline")
    entry_type = models.CharField(max_length=10, choices=ENTRY_TYPE_CHOICES, default="update")
    account = models.ForeignKey(Account, on_delete=models.CASCADE, blank=True, null=True)
    service_charge = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, blank=True, null=True)
    enrollment_number = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user}"
