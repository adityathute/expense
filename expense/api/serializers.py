from rest_framework import serializers
from .models import Category, Service, User, UserService

class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'core_category', 'parent', 'subcategories']

    def get_subcategories(self, obj):
        return CategorySerializer(obj.subcategories.all(), many=True).data
    

class ServiceSerializer(serializers.ModelSerializer):
    total_fees = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = "__all__"

    def get_total_fees(self, obj):
        return obj.total_fees  # ✅ Get the computed total fees

class UserServiceSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)
    service_name = serializers.CharField(source="service.name", read_only=True)

    class Meta:
        model = UserService
        fields = '__all__'

    def create(self, validated_data):
        if 'user' not in validated_data:
            raise serializers.ValidationError({"user": "This field is required."})
        return super().create(validated_data)

class UserSerializer(serializers.ModelSerializer):
    remaining_amount = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = '__all__'  # Ensure required fields are correctly set
        
    def get_remaining_amount(self, obj):
        return obj.total_charge - obj.paid_charge if obj.total_charge and obj.paid_charge else 0

    def update(self, instance, validated_data):
        services_data = validated_data.pop("services_used", [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update or create UserService records
        existing_services = {us.service.id: us for us in instance.services_used.all()}
        for service_data in services_data:
            service_id = service_data["service"].id
            if service_id in existing_services:
                existing_services[service_id].acknowledgment_number = service_data["acknowledgment_number"]
                existing_services[service_id].tracking_number = service_data["tracking_number"]
                existing_services[service_id].amount = service_data["amount"]
                existing_services[service_id].save()
            else:
                UserService.objects.create(user=instance, **service_data)
                
        def validate_mobile_number(self, value):
            if len(value) != 10:
                raise serializers.ValidationError("Mobile number must be exactly 10 digits.")
            return value

        def validate_user_id(self, value):
            if value and len(value) != 12:
                raise serializers.ValidationError("User ID must be exactly 12 digits if provided.")
            return value
    
        return instance
