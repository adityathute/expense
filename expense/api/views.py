from django.http import JsonResponse
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import generics, status, viewsets
from .models import Category, Service, User, ServiceEntry, ServiceTempEntry, Account
from .serializers import CategorySerializer, UserSerializer, ServiceSerializer, AccountSerializer
from rest_framework.generics import DestroyAPIView
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from .choices import CORE_CATEGORIES

# ---------------------- CATEGORY RELATED VIEWS ---------------------- #

@api_view(['GET', 'POST'])
def category_list(request):
    category_type = request.GET.get('type', 'Home')

    if request.method == "POST":
        data = request.data.copy()

        serializer = CategorySerializer(data=data)
        
        if serializer.is_valid():
            category_instance = serializer.save()
            category_instance.category_type = data.get("category_type", category_type)
            category_instance.save()
            
            return Response(CategorySerializer(category_instance).data, status=201)
        
        return Response(serializer.errors, status=400)

    core_category_names = [c[0] for c in CORE_CATEGORIES]
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

# ---------------------- USER RELATED VIEWS ---------------------- #

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
# ---------------------- SERVICE RELATED VIEWS ---------------------- #

class ServiceListCreateView(generics.ListCreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


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

# ---------------------- ACCOUNTS RELATED VIEWS ---------------------- #

class AccountListView(APIView):
    permission_classes = [AllowAny]  # You can replace this with specific permissions later

    def get(self, request, *args, **kwargs):
        # Fetch all active accounts
        accounts = Account.active_objects.all()
        serializer = AccountSerializer(accounts, many=True)
        return Response(serializer.data)
    
class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.active_objects.all()
    serializer_class = AccountSerializer
    permission_classes = [AllowAny]  # You can change this later for authentication

# ---------------------- SERVICE RELATED VIEWS ---------------------- #
