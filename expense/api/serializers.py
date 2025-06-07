from rest_framework import serializers
from .models import Category, Service, ServiceLink, ServiceDepartment, User, UserID, ServiceTempEntry, ServiceEntry, Account
from rest_framework.generics import DestroyAPIView

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

# ---------- Service Group Serializer with parent ----------
class ServiceDepartmentSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    parent = serializers.PrimaryKeyRelatedField(
        queryset=ServiceDepartment.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = ServiceDepartment
        fields = ['id', 'name', 'parent', 'children']

    def get_children(self, obj):
        # Recursively get children that have this object as their parent
        return ServiceDepartmentSerializer(obj.children.all(), many=True).data


# ---------- Service Link Serializer ----------
class ServiceLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceLink
        fields = ['label', 'url']


# ---------- Service Serializer ----------
class ServiceSerializer(serializers.ModelSerializer):
    links = ServiceLinkSerializer(many=True, required=False)
    service_department = ServiceDepartmentSerializer(read_only=True)
    service_department_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceDepartment.objects.all(), source='service_department', write_only=True
    )

    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description', 'service_charge', 'actual_charge',
            'pages_required', 'required_time_hours', 'is_active', 'priority_level',
            'links', 'service_department', 'service_department_id'
        ]

    def create(self, validated_data):
        links_data = validated_data.pop('links', [])
        service = super().create(validated_data)
        for link in links_data:
            ServiceLink.objects.create(service=service, **link)
        return service

    def update(self, instance, validated_data):
        links_data = validated_data.pop('links', [])
        ServiceLink.objects.filter(service=instance).delete()
        for link in links_data:
            ServiceLink.objects.create(service=instance, **link)
        return super().update(instance, validated_data)


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

