from rest_framework import serializers
from .models import Category, Service, User, UserID, ServiceTempEntry, ServiceEntry, Account
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

# ---------------------- SERVICE RELATED SERIALIZER ---------------------- #

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"

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

