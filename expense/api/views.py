from django.http import JsonResponse
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import generics, status, viewsets
from .models import Category, Service, User, UserService, UIDTempEntry, UIDEntry
from .serializers import CategorySerializer, UserSerializer, ServiceSerializer, UserServiceSerializer, UIDTempEntrySerializer, UIDEntrySerializer
from rest_framework.generics import DestroyAPIView

# ---------------------- CATEGORY RELATED VIEWS ---------------------- #

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

# ---------------------- USERS SERVICE RELATED VIEWS ---------------------- #

class UserServiceListCreateView(generics.ListCreateAPIView):
    queryset = UserService.objects.all()
    serializer_class = UserServiceSerializer

class UserServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserService.objects.all()
    serializer_class = UserServiceSerializer

class UserServiceViewSet(viewsets.ModelViewSet):
    queryset = UserService.objects.all()
    serializer_class = UserServiceSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        print("Received data:", data)  # Debugging: Log incoming request

        if not data.get("user"):
            return Response({"error": "User is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=data["user"])  # Ensure user exists
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)  # Debugging
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save(user=user)  # Assign user properly
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# ---------------------- UID SERVICE RELATED VIEWS ---------------------- #

# Create a new UIDTempEntry
class UIDTempEntryCreateView(generics.CreateAPIView):
    queryset = UIDTempEntry.objects.all()
    serializer_class = UIDTempEntrySerializer

    def perform_create(self, serializer):
        print("Creating Temp Entry:", serializer.validated_data)
        super().perform_create(serializer)

# Get all UIDTempEntry records
class UIDTempEntryListView(generics.ListAPIView):
    queryset = UIDTempEntry.objects.all()
    serializer_class = UIDTempEntrySerializer

class UIDEntryCreateView(generics.CreateAPIView):
    queryset = UIDEntry.objects.all()
    serializer_class = UIDEntrySerializer

class TempEntryDeleteView(DestroyAPIView):
    queryset = UIDTempEntry.objects.all()
    serializer_class = UIDTempEntrySerializer
    
# List all UID Entries
class UIDEntryListView(generics.ListAPIView):
    queryset = UIDEntry.objects.all()
    serializer_class = UIDEntrySerializer