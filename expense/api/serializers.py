from rest_framework import serializers
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
)

# ---------------------- CATEGORY RELATED SERIALIZER ---------------------- #


class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)

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


# ---------------------- UID SERVICE RELATED SERIALIZER ---------------------- #
