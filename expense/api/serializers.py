from rest_framework import serializers
from .models import Category, Service, User, UserService, UserID, UIDTempEntry, UIDEntry
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

# ---------------------- USERS SERVICE RELATED SERIALIZER ---------------------- #

class UserServiceSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)
    user_mobile = serializers.CharField(source="user.mobile_number", read_only=True)
    service_name = serializers.CharField(source="service.name", read_only=True)
    user_id = serializers.CharField(source="user.user_id", read_only=True)  # ✅ Include user_id

    class Meta:
        model = UserService
        fields = ['id', 'user', 'user_name', 'user_mobile', 'user_id', 'service', 'service_name', 'acknowledgment_number', 'tracking_number', 'amount']

    def create(self, validated_data):
        if 'user' not in validated_data:
            raise serializers.ValidationError({"user": "This field is required."})
        return super().create(validated_data)

# ---------------------- UID SERVICE RELATED SERIALIZER ---------------------- #

class UIDTempEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = UIDTempEntry
        fields = "__all__"  # Include all fields

class UIDEntrySerializer(serializers.ModelSerializer):
    full_enrollment_number = serializers.SerializerMethodField()

    class Meta:
        model = UIDEntry
        fields = [
            "id",
            "full_name",
            "mobile_number",
            "aadhaar_number",
            "created_at",
            "updated_at",
            "entry_type",
            "status",
            "uid_type",
            "entry_time",
            "enrollment_suffix",
            "full_enrollment_number",
            "service_charge",
            "update_type",
        ]

    def get_full_enrollment_number(self, obj):
        """Generate full 14-digit enrollment number using ENV prefix"""
        return obj.full_enrollment_number or ""

    def validate(self, data):
        if not data.get("enrollment_suffix") or len(data["enrollment_suffix"]) != 5:
            raise serializers.ValidationError(
                {"enrollment_suffix": "Enrollment suffix must be exactly 5 digits!"}
            )
        return data

class UIDEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = UIDEntry
        fields = '__all__'