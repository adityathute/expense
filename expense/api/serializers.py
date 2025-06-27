from rest_framework import serializers
from .models import Category, Service, ServiceLink, User, UserID, Account, Document

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

# ---------- SERVICE RELATED SERIALIZERS ----------

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        exclude = ['is_deleted']

    def validate(self, data):
        service = data.get('service')
        name = data.get('name')

        if self.instance:
            existing = Document.objects.filter(
                service=service, name__iexact=name, is_deleted=False
            ).exclude(pk=self.instance.pk)
        else:
            existing = Document.objects.filter(
                service=service, name__iexact=name, is_deleted=False
            )

        if service and name and existing.exists():
            raise serializers.ValidationError("This document already exists for this service.")
        return data

class ServiceLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceLink
        fields = ['label', 'url']


class ServiceSerializer(serializers.ModelSerializer):
    links = ServiceLinkSerializer(many=True, required=False)
    required_documents = DocumentSerializer(many=True, required=False)

    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description',
            'service_fee', 'service_charge', 'other_charge',
            'pages_required', 'required_time_hours',
            'is_active', 'links',
            'required_documents',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_links(self, value):
        # Remove empty links (no label and no URL)
        return [
            link for link in value
            if link.get('label') or link.get('url')
        ]

    def create(self, validated_data):
        links_data = validated_data.pop('links', [])
        documents_data = validated_data.pop('required_documents', [])
        service = Service.objects.create(**validated_data)

        for link in links_data:
            ServiceLink.objects.create(service=service, **link)

        for doc in documents_data:
            Document.objects.create(service=service, **doc)

        return service

    def update(self, instance, validated_data):
        links_data = validated_data.pop('links', [])
        documents_data = validated_data.pop('required_documents', [])

        # Update core fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Clear and recreate links
        ServiceLink.objects.filter(service=instance).delete()
        for link in links_data:
            ServiceLink.objects.create(service=instance, **link)

        # Clear and recreate documents
        existing_docs = {doc.name.lower(): doc for doc in instance.required_documents.all()}
        new_docs = {doc['name'].lower(): doc for doc in documents_data}

        # Delete removed documents
        for name in set(existing_docs) - set(new_docs):
            existing_docs[name].delete()

        # Update existing or add new
        for name, doc_data in new_docs.items():
            if name in existing_docs:
                for attr, val in doc_data.items():
                    setattr(existing_docs[name], attr, val)
                existing_docs[name].save()
            else:
                Document.objects.create(service=instance, **doc_data)

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

