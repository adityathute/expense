from django.db import models
from django.conf import settings
from decouple import config
from django.core.exceptions import ValidationError
from .choices import CATEGORY_TYPES, CORE_CATEGORIES, GENDER_CHOICES, ID_TYPES, DOCUMENT_TYPE_CHOICES, ENTRY_TYPE_CHOICES, UID_TYPE_CHOICES,  UPDATE_TYPE_CHOICES, ENTRY_TYPE_CHOICES, STATUS_CHOICES, UID_TYPE_CHOICES, UPDATE_TYPE_CHOICES, PAYMENT_TYPE_CHOICES, CATEGORY_CHOICES, FREQUENCY_CHOICES, ACCOUNT_MODE_CHOICES, SUB_ACCOUNT_CHOICES, USER_TYPES, INTEREST_FREQUENCY_CHOICES
import os
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.db import transaction as db_transaction
import uuid

# ---------------------- USER RELATED MODELS ---------------------- #
class User(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    mobile_number = models.CharField(max_length=10, blank=True, null=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPES, blank=True, null=True, default="Customer")
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

class UserID(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="identifications")
    id_name = models.CharField(max_length=255)
    id_number = models.CharField(max_length=20, blank=True, null=True)
    is_deleted = models.BooleanField(default=False, verbose_name="Is Deleted")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.name}: {self.id_number}" if self.id_number else f"{self.user.name} - No ID"

# ---------------------- CATEGORY RELATED MODEL ---------------------- #

class Category(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="subcategories")
    core_category = models.CharField(max_length=20, choices=CORE_CATEGORIES, null=True, blank=True)
    category_type = models.BooleanField(default=False, verbose_name="Is Personal")  # False = Shop, True = Personal
    is_core = models.BooleanField(default=False, verbose_name="Is Core")
    is_deleted = models.BooleanField(default=False, verbose_name="Is Deleted")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["core_category", "name"]
        unique_together = ("name", "category_type")

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
    passport_required = models.BooleanField(default=False, help_text="Is passport required?")
    photo_count = models.PositiveIntegerField(default=0, help_text="Number of passport photos required")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    required_documents = models.ManyToManyField(
        "Document",
        through="ServiceDocumentRequirement",
        related_name="services"
    )

    supporting_documents = models.ManyToManyField(
        "SupportingDocument",
        through="ServiceSupportingDocument",
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

class SupportingDocument(models.Model):
    name = models.CharField(max_length=255)  # e.g., "Self Declaration"
    file = models.FileField(upload_to='supporting_documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        services = self.services.all()
        service_names = ", ".join([s.name for s in services])
        return f"{self.name} (Linked to: {service_names})"

class ServiceSupportingDocument(models.Model):
    service = models.ForeignKey("Service", on_delete=models.CASCADE)
    supporting_document = models.ForeignKey("SupportingDocument", on_delete=models.CASCADE)

    class Meta:
        unique_together = ("service", "supporting_document")

    def __str__(self):
        return f"{self.supporting_document.name} for {self.service.name}"

# ---------------------- ACCOUNTS RELATED MODELS ---------------------- #

class ActiveAccountManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

class Account(models.Model):
    account_holder_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Account Holder's Name")
    account_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="Account Number")
    account_mode = models.CharField(choices=ACCOUNT_MODE_CHOICES, max_length=25)
    sub_account_type = models.CharField(choices=SUB_ACCOUNT_CHOICES, max_length=50, blank=True, null=True)
    bank_service_name = models.CharField(max_length=255, blank=True, null=True)
    ifsc_code = models.CharField(max_length=20, blank=True, null=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    issue_date = models.DateField(null=True, blank=True)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, verbose_name="Category")
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False, verbose_name="Is Deleted")
    objects = models.Manager()
    active_objects = ActiveAccountManager()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        # Cash mode: only simple fields required
        if self.account_mode == "Cash":
            self.account_number = None
            self.ifsc_code = None

        # Investments: account_number and IFSC not required
        elif self.account_mode == "Investments":
            self.account_number = None
            self.ifsc_code = None
            if not self.bank_service_name:
                raise ValidationError("Bank/Institute/Shop Name is required for Investments.")
            if not self.sub_account_type:
                raise ValidationError("Sub Account Type is required for Investments.")
            if not self.account_holder_name:
                raise ValidationError("Account Holder Name is required for Investments.")
            if not self.issue_date:
                raise ValidationError("Issue Date is required for Investments.")

        # Bank/Savings mode: full bank fields required
        elif self.account_mode in ["Online", "Savings"]:
            if not self.account_number:
                raise ValidationError({"account_number": "Account number is required for non-cash accounts."})
            if not self.ifsc_code:
                raise ValidationError({"ifsc_code": "IFSC code is required for non-cash accounts."})
            if self.account_number and Account.objects.exclude(pk=self.pk).filter(account_number=self.account_number).exists():
                raise ValidationError({"account_number": "Account number must be unique."})
            
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.account_holder_name or '-'} ({self.bank_service_name or '-'}) - {self.account_number or '-'}"

    class Meta:
        verbose_name = 'Account'
        verbose_name_plural = 'Accounts'

        indexes = [
            models.Index(fields=['account_number']),
            models.Index(fields=['account_holder_name']),
        ]

# ---------------------- TRANSACTION RELATED MODELS ---------------------- #
class GlobalTransactionCounter(models.Model):
    last_id = models.PositiveIntegerField(default=0)

class Transaction(models.Model):
    global_id = models.PositiveIntegerField(unique=True, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True)  # Default account
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    is_cleared = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False, verbose_name="Is Deleted")
    is_split = models.BooleanField(default=False, verbose_name="Is Split Payment")
    split_details = models.JSONField(default=list, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not self.global_id:
            with db_transaction.atomic():
                counter, _ = GlobalTransactionCounter.objects.select_for_update().get_or_create(id=1)
                counter.last_id += 1
                counter.save()
                self.global_id = counter.last_id
        super().save(*args, **kwargs)

    # Helper method to add a split payment
    def add_split_payment(self, payment_method, amount, account=None, cash_counter=None):
        entry = {
            "payment_method": payment_method,
            "amount": float(amount)
        }
        if account:
            entry["account_id"] = account.id
        if cash_counter:
            entry["cash_counter"] = cash_counter

        # Always append, allow multiple splits of same type
        self.split_details.append(entry)
        self.save()

class ServiceTransaction(Transaction):
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    acknowledgement_number = models.CharField(max_length=255, blank=True, null=True)
    enrollment_number = models.CharField(max_length=50, blank=True, null=True)
    tracking_id = models.CharField(max_length=255, blank=True, null=True)
    mobile_number = models.CharField(max_length=10, blank=True, null=True)
    entry_type = models.CharField(max_length=10, choices=ENTRY_TYPE_CHOICES, default="update", blank=True, null=True)
    service_charge = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending", blank=True, null=True)

    def __str__(self):
        return f"Service {self.user or ''} ({self.service})"

class FinanceTransaction(Transaction):
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    is_transfer = models.BooleanField(default=False)
    from_account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True, related_name='transfers_from')
    to_account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True, related_name='transfers_to')
    is_recurring = models.BooleanField(default=False)
    recurring_frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, blank=True, null=True)  
    tenure = models.PositiveIntegerField(blank=True, null=True)
    group_id = models.UUIDField(null=True, blank=True)
    is_debt = models.BooleanField(default=False)
    debt_type = models.CharField(max_length=10, blank=True, null=True, choices=[('Borrow','Borrow'), ('Lend','Lend')])
    due_date = models.DateField(null=True, blank=True)
    interest_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    next_due_date = models.DateField(null=True, blank=True)
    due_range_start = models.DateField(null=True, blank=True)
    due_range_end = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, blank=True, null=True)
    last_payment_date = models.DateField(null=True, blank=True)
    # Loan Realated Fields
    is_loan = models.BooleanField(default=False)
    principal_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total_emi_paid = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    processing_fee = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    effective_cost_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    interest_frequency = models.CharField(max_length=10, choices=INTEREST_FREQUENCY_CHOICES, default="monthly")
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Annual %")
    emi_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    party_name = models.CharField(max_length=255, null=True, blank=True)
    loan_id = models.CharField(max_length=100, null=True, blank=True)
    remaining_balance = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    loan_start_date = models.DateField(null=True, blank=True)
    penalty_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_foreclosed = models.BooleanField(default=False)
    closed_date = models.DateField(null=True, blank=True)
    close_reason = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Finance {self.user}"

# ---------------------- SHOP-DETAILS RELATED MODELS ---------------------- #

# ---------------------- SHOP DETAILS ---------------------- #
class Shop(models.Model):
    name = models.CharField(max_length=150)
    owner_name = models.CharField(max_length=100, blank=True, null=True)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# ---------------------- SHOP ATTENDANCE (Open / Close) ---------------------- #
class ShopAttendance(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="shop_attendance")
    date = models.DateField()
    opened_by = models.CharField(max_length=100, help_text="Name of person who opened the shop")
    open_time = models.TimeField(blank=True, null=True)
    close_time = models.TimeField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ("shop", "date")  # Only one record per day per shop

    def __str__(self):
        return f"{self.shop.name} - {self.date} (Opened by {self.opened_by})"


# ---------------------- STAFF DETAILS ---------------------- #
class Staff(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="staff_members")
    name = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    position = models.CharField(max_length=50, blank=True, null=True)
    join_date = models.DateField(blank=True, null=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.shop.name})"


# ---------------------- STAFF ATTENDANCE ---------------------- #
class StaffAttendance(models.Model):
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name="attendance_records")
    date = models.DateField()
    status = models.CharField(
        max_length=10,
        choices=[
            ("Present", "Present"),
            ("Absent", "Absent"),
            ("Leave", "Leave"),
        ],
        default="Present",
    )
    check_in_time = models.TimeField(blank=True, null=True)
    check_out_time = models.TimeField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ("staff", "date")

    def __str__(self):
        return f"{self.staff.name} - {self.date} ({self.status})"

    @property
    def total_work_hours(self):
        """Optional: Calculate total hours worked."""
        if self.check_in_time and self.check_out_time:
            from datetime import datetime
            check_in = datetime.combine(self.date, self.check_in_time)
            check_out = datetime.combine(self.date, self.check_out_time)
            return check_out - check_in
        return None