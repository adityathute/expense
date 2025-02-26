from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'core_category', 'parent', 'subcategories']

    def get_subcategories(self, obj):
        return CategorySerializer(obj.subcategories.all(), many=True).data
