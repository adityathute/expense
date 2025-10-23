from rest_framework import serializers
from decimal import Decimal
from django.db import transaction
from django.db.models import F
from .models import (
    Category,
    Service,
    ServiceLink,
    User,
    UserID,
    Account,
    Document,
    DocumentCategory,
    DocumentCategory,
    Document,
    Service,
    ServiceLink,
    ServiceDocumentRequirement,
    SupportingDocument,
    ServiceSupportingDocument,
    ServiceTransaction, 
    FinanceTransaction
)

# ---------------------- CATEGORY RELATED SERIALIZER ---------------------- #


class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False
    )
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "core_category",
            "parent",
            "subcategories",
            "category_type",
            "is_deleted",
        ]
        read_only_fields = ["subcategories"]

# ---------------------- USER RELATED SERIALIZERS ---------------------- #
class UserIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserID
        fields = ["id", "id_name", "id_number", "is_deleted", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class UserSerializer(serializers.ModelSerializer):
    identifications = UserIDSerializer(many=True, required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "mobile_number",
            "gender",
            "user_type",
            "is_deleted",  # <-- add this
            "identifications",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        identifications_data = validated_data.pop("identifications", [])
        user = User.objects.create(**validated_data)
        for id_data in identifications_data:
            if id_data.get("id_number"):
                UserID.objects.create(user=user, **id_data)
        return user

    def update(self, instance, validated_data):
        identifications_data = validated_data.pop("identifications", None)
        instance = super().update(instance, validated_data)

        if identifications_data is not None:
            existing_ids = {id.id: id for id in instance.identifications.all()}

            for id_data in identifications_data:
                id_pk = id_data.get("id")
                if id_pk and id_pk in existing_ids:
                    id_obj = existing_ids.pop(id_pk)
                    id_obj.id_number = id_data.get("id_number", id_obj.id_number)
                    id_obj.is_deleted = id_data.get("is_deleted", id_obj.is_deleted)
                    id_obj.save()
                else:
                    if id_data.get("id_number"):
                        UserID.objects.create(user=instance, **id_data)

            # Delete leftover IDs
            for remaining_id in existing_ids.values():
                remaining_id.delete()

        return instance

# ---------------------- SERVICE RELATED SERIALIZER ---------------------- #
class DocumentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentCategory
        fields = ["id", "name"]


class DocumentSerializer(serializers.ModelSerializer):
    categories = serializers.ListField(child=serializers.CharField(), write_only=True)
    category_names = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Document
        fields = [
            "id",
            "name",
            "additional_details",
            "categories",
            "category_names",
            "created_at",
        ]

    def get_category_names(self, obj):
        return [cat.name for cat in obj.document_categories.all()]

    def create(self, validated_data):
        category_names = validated_data.pop("categories", [])
        document = Document.objects.create(**validated_data)
        for cat_name in category_names:
            cat, _ = DocumentCategory.objects.get_or_create(name=cat_name.strip())
            document.document_categories.add(cat)
        return document


class ServiceLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceLink
        fields = ["label", "url"]


class NestedDocumentSerializer(serializers.ModelSerializer):
    category_names = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ["id", "name", "additional_details", "category_names"]

    def get_category_names(self, obj):
        return [cat.name for cat in obj.document_categories.all()]


class DocumentRequirementReadSerializer(serializers.ModelSerializer):
    document = NestedDocumentSerializer()
    requirement_type = serializers.CharField(
        source="get_requirement_type_display"
    )  # gets "Original", "Xerox", etc.

    class Meta:
        model = ServiceDocumentRequirement
        fields = ["id", "document", "requirement_type"]  # <- MUST include it here


class ServiceDocumentRequirementSerializer(serializers.ModelSerializer):
    document = DocumentSerializer(read_only=True)
    document_id = serializers.PrimaryKeyRelatedField(
        queryset=Document.objects.all(), source="document", write_only=True
    )
    service = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ServiceDocumentRequirement
        fields = [
            "id",
            "service",
            "document",
            "document_id",
            "requirement_type",
            "is_mandatory",
        ]


class SupportingDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportingDocument
        fields = ["id", "name", "file", "uploaded_at"]
        read_only_fields = ["uploaded_at"]


class ServiceSupportingDocumentSerializer(serializers.ModelSerializer):
    supporting_document = SupportingDocumentSerializer(read_only=True)
    supporting_document_id = serializers.PrimaryKeyRelatedField(
        queryset=SupportingDocument.objects.all(),
        source="supporting_document",
        write_only=True,
    )
    service = serializers.PrimaryKeyRelatedField(queryset=Service.objects.all())

    class Meta:
        model = ServiceSupportingDocument
        fields = ["id", "service", "supporting_document", "supporting_document_id"]


class ServiceSerializer(serializers.ModelSerializer):
    links = ServiceLinkSerializer(many=True, required=False)
    required_documents = serializers.PrimaryKeyRelatedField(
        queryset=Document.objects.all(), many=True, required=False
    )
    servicedocumentrequirement_set = ServiceDocumentRequirementSerializer(
        many=True, write_only=True, required=False
    )
    requirements = DocumentRequirementReadSerializer(
        many=True, read_only=True, source="servicedocumentrequirement_set"
    )
    servicesupportingdocument_set = ServiceSupportingDocumentSerializer(
        many=True, write_only=True, required=False
    )
    linked_supporting_documents = ServiceSupportingDocumentSerializer(
        many=True, read_only=True, source="servicesupportingdocument_set"
    )

    class Meta:
        model = Service
        fields = [
            "id",
            "name",
            "description",
            "service_fee",
            "service_charge",
            "other_charge",
            "pages_required",
            "required_time_hours",
            "passport_required",
            "photo_count",
            "is_active",
            "is_deleted",
            "links",
            "required_documents",
            "servicedocumentrequirement_set",
            "requirements",
            "servicesupportingdocument_set",
            "linked_supporting_documents",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def create(self, validated_data):
        links_data = validated_data.pop("links", [])
        required_documents_data = validated_data.pop("required_documents", [])
        requirements_data = validated_data.pop("servicedocumentrequirement_set", [])
        supporting_documents_data = validated_data.pop(
            "servicesupportingdocument_set", []
        )

        # Create the service without many-to-many field
        service = Service.objects.create(**validated_data)

        # Add links
        for link in links_data:
            ServiceLink.objects.create(service=service, **link)

        # Set required documents (ManyToMany)
        if required_documents_data:
            service.required_documents.set(required_documents_data)

        # Add document requirements
        for requirement in requirements_data:
            document = requirement.pop("document", None)
            if not document:
                document = requirement.pop("document_id", None)

            if not document:
                raise serializers.ValidationError(
                    "Document is required for each requirement."
                )

            ServiceDocumentRequirement.objects.create(
                service=service, document=document, **requirement
            )

        for doc in supporting_documents_data:
            supporting_document = doc.get("supporting_document") or doc.get(
                "supporting_document_id"
            )
            if supporting_document:
                ServiceSupportingDocument.objects.create(
                    service=service, supporting_document=supporting_document
                )

        return service

    def update(self, instance, validated_data):
        links_data = validated_data.pop("links", [])
        requirements_data = validated_data.pop("servicedocumentrequirement_set", [])
        required_documents_data = validated_data.pop("required_documents", [])
        supporting_documents_data = validated_data.pop(
            "servicesupportingdocument_set", []
        )

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update links
        ServiceLink.objects.filter(service=instance).delete()
        for link in links_data:
            ServiceLink.objects.create(service=instance, **link)

        # Update required documents
        instance.required_documents.set(required_documents_data)

        # Update document requirements
        ServiceDocumentRequirement.objects.filter(service=instance).delete()
        for req_data in requirements_data:
            ServiceDocumentRequirement.objects.create(service=instance, **req_data)

        # Update supporting documents: 🛠 sync instead of delete all
        existing_links = {
            s.supporting_document_id: s
            for s in ServiceSupportingDocument.objects.filter(service=instance)
        }

        new_ids = set()
        for doc in supporting_documents_data:
            doc_id = doc.get("supporting_document") or doc.get("supporting_document_id")
            if doc_id and doc_id not in existing_links:
                ServiceSupportingDocument.objects.create(
                    service=instance, supporting_document=doc_id
                )
            new_ids.add(doc_id)

        return instance


# ---------------------- ACCOUNTS RELATED SERIALIZER ---------------------- #


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = "__all__"
        extra_kwargs = {
            "account_holder_name": {"required": False, "allow_null": True},
            "account_number": {"required": False, "allow_null": True},
            "bank_service_name": {"required": False, "allow_null": True},
            "ifsc_code": {"required": False, "allow_null": True},
            "account_type": {"required": False, "allow_null": True},
        }


# ---------------------- TRANSACTIONS RELATED SERIALIZER ---------------------- #
class ServiceTransactionSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_fee = serializers.DecimalField(source='service.service_fee', max_digits=10, decimal_places=2, read_only=True)
    global_id = serializers.CharField(read_only=True)

    class Meta:
        model = ServiceTransaction
        fields = ["id", "global_id", "user", "amount", "service", "service_name", "service_fee", "date_created", "is_recurring", "recurring_frequency", "next_due_date", "status"]

class FinanceTransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    global_id = serializers.CharField(read_only=True)
    
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
    
    # Add recurring fields
    is_recurring = serializers.BooleanField(default=False)
    recurring_frequency = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    next_due_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = FinanceTransaction
        fields = [
            "id", "global_id", "user", "amount", "category", "category_name",
            "account", "split_details", "is_split", "is_recurring", "recurring_frequency", "next_due_date",
            "date_created"
        ]

    def create(self, validated_data):
        split_details = validated_data.pop("split_details", [])
        
        # Extract recurring fields
        is_recurring = validated_data.pop("is_recurring", False)
        recurring_frequency = validated_data.pop("recurring_frequency", None)
        next_due_date = validated_data.pop("next_due_date", None)

        account = validated_data.get("account", None)
        category = validated_data.get("category", None)
        amount_raw = validated_data.get("amount", "0")

        # Convert amount string to Decimal
        try:
            amount = Decimal(str(amount_raw))
        except Exception:
            amount = Decimal("0")

        with transaction.atomic():
            tx = FinanceTransaction.objects.create(
                **validated_data,
                is_recurring=is_recurring,
                recurring_frequency=recurring_frequency,
                next_due_date=next_due_date
            )
            
            # Ensure amount is positive
            amount = abs(amount)

            # Single account update if no splits
            if not split_details and account is not None:
                if getattr(category, "core_category", None) == "Income":
                    Account.objects.filter(pk=account.pk).update(balance=F('balance') + amount)
                elif getattr(category, "core_category", None) == "Expense":
                    Account.objects.filter(pk=account.pk).update(balance=F('balance') - amount)
                account.refresh_from_db()

            # Process split payments
            for split in split_details:
                split_amount = abs(Decimal(str(split.get("amount", 0))))
                split_account_id = split.get("account_id")
                split_account = None
                if split_account_id:
                    split_account = Account.objects.get(pk=split_account_id)

                if split_account:
                    if getattr(category, "core_category", None) == "Income":
                        Account.objects.filter(pk=split_account.pk).update(balance=F('balance') + split_amount)
                    elif getattr(category, "core_category", None) == "Expense":
                        Account.objects.filter(pk=split_account.pk).update(balance=F('balance') - split_amount)
                    split_account.refresh_from_db()

                tx.add_split_payment(
                    payment_method=split.get("payment_method"),
                    amount=split_amount,
                    account=split_account,
                    cash_counter=split.get("cash_counter")
                )

            return tx
