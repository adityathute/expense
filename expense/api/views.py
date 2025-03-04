from django.http import JsonResponse
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from .models import Category, Service, User, UserService
from .serializers import CategorySerializer, UserSerializer, ServiceSerializer, UserServiceSerializer
from rest_framework import generics, status, viewsets
from rest_framework.response import Response

@api_view(['GET', 'POST'])
def category_list(request):
    category_type = request.GET.get('type', 'Home')  # Default to Home

    if request.method == "POST":
        data = request.data.copy()

        serializer = CategorySerializer(data=data)
        
        if serializer.is_valid():
            category_instance = serializer.save()  # ✅ Save the category first
            category_instance.category_type = data.get("category_type", category_type)  # ✅ Explicitly set category_type
            category_instance.save()  # ✅ Save the updated category
            
            return Response(CategorySerializer(category_instance).data, status=201)
        
        return Response(serializer.errors, status=400)

    core_category_names = [c[0] for c in Category.CORE_CATEGORIES]
    categories = Category.objects.filter(category_type=category_type).exclude(name__in=core_category_names)
    
    return Response({
        "categories": CategorySerializer(categories, many=True).data,
        "core_categories": core_category_names
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


class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
class ServiceListCreateView(generics.ListCreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

class UserServiceListCreateView(generics.ListCreateAPIView):
    queryset = UserService.objects.all()
    serializer_class = UserServiceSerializer

class UserServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserService.objects.all()
    serializer_class = UserServiceSerializer

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    # Automatic calculation of total_fees (already in serializer)
    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    # DELETE Service
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"message": "Service deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
