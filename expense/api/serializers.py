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
    class Meta:
        model = Service
        fields = "__all__"

class UserServiceSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source="service.name", read_only=True)

    class Meta:
        model = UserService
        fields = "__all__"

class UserSerializer(serializers.ModelSerializer):
    services_used = UserServiceSerializer(many=True, read_only=True)
    remaining_amount = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = "__all__"