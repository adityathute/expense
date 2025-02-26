from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Category
from .serializers import CategorySerializer

@api_view(['GET', 'POST'])
def category_list(request):
    if request.method == "POST":
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    core_category_names = [c[0] for c in Category.CORE_CATEGORIES]  # Extract core category names
    categories = Category.objects.exclude(name__in=core_category_names)
    return Response({
        "categories": CategorySerializer(categories, many=True).data,
        "core_categories": core_category_names  # Return names, not objects
    })

@api_view(['GET', 'PUT', 'DELETE'])
def category_detail(request, category_id):
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        return Response({"error": "Category not found"}, status=404)

    if request.method == "PUT":
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == "DELETE":
        category.delete()
        return Response({"message": "Category deleted successfully"}, status=204)

    return Response(CategorySerializer(category).data)
