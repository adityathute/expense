from rest_framework import serializers
from .models import Category, Service, ServiceLink, User, UserID, Account, Document, DocumentCategory, DocumentCategory, Document, Service, ServiceLink, ServiceDocumentRequirement

# ---------------------- CATEGORY RELATED SERIALIZER ---------------------- #

class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'core_category', 'parent', 'subcategories']

    def get_subcategories(self, obj):
        return CategorySerializer(obj.subcategories.all(), many=True).data
    
# ---------------------- USER RELATED SERIALIZERS ---------------------- #

class UserIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserID
        fields = ["id_type", "id_number", "other_doc_name"]  # ✅ Added other_doc_name field

class UserSerializer(serializers.ModelSerializer):
    identifications = UserIDSerializer(many=True, required=False)  # ✅ Make optional

    class Meta:
        model = User
        fields = ["id", "name", "mobile_number", "gender", "user_type", "identifications"]

    def create(self, validated_data):
        identifications_data = validated_data.pop("identifications", [])
        user = User.objects.create(**validated_data)
        
        # ✅ Create IDs only if provided
        for id_data in identifications_data:
            if id_data.get("id_number"):  # ✅ Only create if ID number is given
                UserID.objects.create(user=user, **id_data)
        
        return user

    def update(self, instance, validated_data):
        if "mobile_number" in validated_data:
            existing_user = User.objects.filter(mobile_number=validated_data["mobile_number"]).exclude(id=instance.id).first()
            if existing_user:
                raise serializers.ValidationError({"mobile_number": "This number is already used by another user."})

        return super().update(instance, validated_data)
    
# ---------------------- SERVICE RELATED SERIALIZER ---------------------- #

class DocumentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentCategory
        fields = ['id', 'name']

class DocumentSerializer(serializers.ModelSerializer):
    categories = serializers.ListField(child=serializers.CharField(), write_only=True)
    category_names = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Document
        fields = ["id", "name", "additional_details", "categories", "category_names", "created_at"]

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
        fields = ['label', 'url']

class ServiceDocumentRequirementSerializer(serializers.ModelSerializer):
    document = DocumentSerializer(read_only=True)
    document_id = serializers.PrimaryKeyRelatedField(queryset=Document.objects.all(), source='document', write_only=True)

    class Meta:
        model = ServiceDocumentRequirement
        fields = ['id', 'service', 'document', 'document_id']


class ServiceSerializer(serializers.ModelSerializer):
    links = ServiceLinkSerializer(many=True, required=False)
    required_documents = serializers.PrimaryKeyRelatedField(
        queryset=Document.objects.all(), many=True, write_only=True, required=False
    )
    documents = DocumentSerializer(many=True, read_only=True, source='get_required_documents')

    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description',
            'service_fee', 'service_charge', 'other_charge',
            'pages_required', 'required_time_hours',
            'is_active', 'links', 'required_documents', 'documents',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        links_data = validated_data.pop('links', [])
        required_documents_data = validated_data.pop('required_documents', [])
        requirements_data = validated_data.pop('servicedocumentrequirement_set', [])

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
            document_data = requirement.pop('document')
            categories_data = document_data.pop('document_categories', [])
            document = Document.objects.create(**document_data)

            for category in categories_data:
                cat_obj, _ = DocumentCategory.objects.get_or_create(name=category['name'])
                document.document_categories.add(cat_obj)

            ServiceDocumentRequirement.objects.create(
                service=service,
                document=document,
                **requirement
            )

        return service

    def update(self, instance, validated_data):
        links_data = validated_data.pop('links', [])
        requirements_data = validated_data.pop('servicedocumentrequirement_set', [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update links
        ServiceLink.objects.filter(service=instance).delete()
        for link in links_data:
            ServiceLink.objects.create(service=instance, **link)

        # Update document requirements
        ServiceDocumentRequirement.objects.filter(service=instance).delete()
        for requirement in requirements_data:
            document_data = requirement.pop('document')
            categories_data = document_data.pop('document_categories', [])

            document = Document.objects.create(**document_data)
            for category in categories_data:
                cat_obj, _ = DocumentCategory.objects.get_or_create(name=category['name'])
                document.document_categories.add(cat_obj)

            ServiceDocumentRequirement.objects.create(
                service=instance,
                document=document,
                **requirement
            )

        return instance

# ---------------------- ACCOUNTS RELATED SERIALIZER ---------------------- #

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'
        extra_kwargs = {
            'account_holder_name': {'required': False, 'allow_null': True},
            'account_number': {'required': False, 'allow_null': True},
            'bank_service_name': {'required': False, 'allow_null': True},
            'ifsc_code': {'required': False, 'allow_null': True},
            'account_type': {'required': False, 'allow_null': True},
        }

# ---------------------- UID SERVICE RELATED SERIALIZER ---------------------- #

