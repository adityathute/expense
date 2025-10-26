# transactions/transactions_serializers.py

import uuid
from decimal import Decimal
from django.db import transaction
from django.db.models import F
from rest_framework import serializers
from ..models import Account
from ..models import FinanceTransaction, ServiceTransaction

# ---------------------- SERVICE TRANSACTION SERIALIZER ---------------------- #
class ServiceTransactionSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_fee = serializers.DecimalField(source='service.service_fee', max_digits=10, decimal_places=2, read_only=True)
    global_id = serializers.CharField(read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True) 

    class Meta:
        model = ServiceTransaction
        fields = [
            "id", "global_id", "user", "user_name", "amount", "service",
            "service_name", "service_fee", "date_created",
            "is_recurring", "recurring_frequency", "next_due_date", "status"
        ]


# ---------------------- FINANCE TRANSACTION SERIALIZER ---------------------- #
class FinanceTransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    global_id = serializers.CharField(read_only=True)
    is_cleared = serializers.BooleanField(default=False)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    user_name = serializers.CharField(source='user.name', read_only=True)

    account = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.filter(is_deleted=False),
        required=False,
        allow_null=True,
    )

    split_details = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True,
    )

    is_split = serializers.BooleanField(default=False)

    # Recurring fields
    is_recurring = serializers.BooleanField(default=False)
    recurring_frequency = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    next_due_date = serializers.DateField(required=False, allow_null=True)
    due_range_start = serializers.DateField(required=False, allow_null=True)
    due_range_end = serializers.DateField(required=False, allow_null=True)
    status = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    group_id = serializers.UUIDField(read_only=True, allow_null=True)
    last_payment_date = serializers.DateField(required=False, allow_null=True)
    is_transfer = serializers.BooleanField(default=False)
    from_account = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.filter(is_deleted=False),
        required=False, allow_null=True
    )
    to_account = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.filter(is_deleted=False),
        required=False, allow_null=True
    )

    class Meta:
        model = FinanceTransaction
        fields = [
            "id", "global_id", "user", "user_name", "amount", "category", "category_name",
            "account", "split_details", "is_split", "description",
            "is_recurring", "recurring_frequency",
            "next_due_date", "due_range_start", "due_range_end", "status",
            "last_payment_date", "group_id",
            "date_created", "is_cleared",
            "is_transfer", "from_account", "to_account"
        ]

    def create(self, validated_data):
        split_details = validated_data.pop("split_details", [])
        is_recurring = validated_data.pop("is_recurring", False)
        status = validated_data.pop("status", None)
        group_id = validated_data.pop("group_id", None)
        is_transfer = validated_data.get("is_transfer", False)

        # --- Handle Recurring / Non-Recurring ---
        if not is_recurring:
            validated_data.pop("recurring_frequency", None)
            validated_data.pop("next_due_date", None)
            validated_data.pop("due_range_start", None)
            validated_data.pop("due_range_end", None)
            validated_data.pop("last_payment_date", None)
            status = None
            group_id = None
        else:
            if not status:
                status = "planned"
            if not group_id:
                group_id = uuid.uuid4()

        validated_data["is_cleared"] = False if is_recurring and status == "planned" else True

        # Ensure amount is positive decimal
        amount_raw = validated_data.get("amount", 0)
        try:
            amount = abs(Decimal(str(amount_raw)))
        except Exception:
            amount = Decimal("0")

        # Fetch category object if provided
        category = validated_data.get("category", None)
        category_obj = None
        if category:
            category_obj = category

        with transaction.atomic():
            # --- Transfer Transaction ---
            if is_transfer:
                from_acc = validated_data.pop("from_account", None)
                to_acc = validated_data.pop("to_account", None)
                tx = FinanceTransaction.objects.create(
                    **validated_data,
                    from_account=from_acc,
                    to_account=to_acc
                )
                if from_acc:
                    Account.objects.filter(pk=from_acc.pk).update(balance=F("balance") - amount)
                    from_acc.refresh_from_db()
                if to_acc:
                    Account.objects.filter(pk=to_acc.pk).update(balance=F("balance") + amount)
                    to_acc.refresh_from_db()
                return tx

            # --- Normal / Split Transaction ---
            tx = FinanceTransaction.objects.create(
                **validated_data,
                is_recurring=is_recurring,
                status=status,
                group_id=group_id
            )

            # --- Single Account Transaction ---
            if tx.is_cleared and not split_details and validated_data.get("account"):
                acc = validated_data.get("account")
                if category_obj:
                    core = getattr(category_obj, "core_category", None)
                    if core in ["Income", "Savings", "Investments"]:
                        Account.objects.filter(pk=acc.pk).update(balance=F('balance') + amount)
                    elif core == "Expense":
                        Account.objects.filter(pk=acc.pk).update(balance=F('balance') - amount)
                acc.refresh_from_db()

            # --- Split Transactions ---
            for split in split_details:
                split_amount = abs(Decimal(str(split.get("amount", 0))))
                split_account = Account.objects.get(pk=split.get("account_id")) if split.get("account_id") else None

                if tx.is_cleared and split_account and category_obj:
                    core = getattr(category_obj, "core_category", None)
                    if core in ["Income", "Savings", "Investments"]:
                        Account.objects.filter(pk=split_account.pk).update(balance=F('balance') + split_amount)
                    elif core == "Expense":
                        Account.objects.filter(pk=split_account.pk).update(balance=F('balance') - split_amount)
                    split_account.refresh_from_db()

                # Optional: handle any additional split payments if method exists
                if hasattr(tx, "add_split_payment"):
                    tx.add_split_payment(
                        payment_method=split.get("payment_method"),
                        amount=split_amount,
                        account=split_account,
                        cash_counter=split.get("cash_counter")
                    )

            return tx

