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
    service_name = serializers.CharField(source="service.name", read_only=True)  # ✅ Correctly fetch service name
    service_total_fees = serializers.DecimalField(source="service.total_fees", max_digits=10, decimal_places=2, read_only=True)  # ✅ Fetch total fees

    class Meta:
        model = UserService
        fields = ["id", "service", "service_name", "service_total_fees", "acknowledgment_number", "tracking_number", "amount"]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"

    services_used = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(),
        many=True
    )


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

        return instance
