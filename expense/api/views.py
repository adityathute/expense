from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import generics, status, viewsets
from .models import Category, Service, User, Account, Document, ServiceDocumentRequirement, DocumentCategory, SupportingDocument, ServiceSupportingDocument
from .serializers import CategorySerializer, UserSerializer, ServiceSerializer, AccountSerializer, DocumentSerializer, ServiceDocumentRequirementSerializer, SupportingDocumentSerializer, ServiceSupportingDocumentSerializer
from rest_framework.generics import DestroyAPIView
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from .choices import CORE_CATEGORIES
from django.http import FileResponse, JsonResponse
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from PyPDF2 import PdfReader, PdfWriter
import os
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register the Gotham font (run once before using it)
pdfmetrics.registerFont(TTFont('Gotham', os.path.join('static', 'fonts', 'Gotham-Book.ttf')))
# ---------------------- CATEGORY RELATED VIEWS ---------------------- #

@api_view(['GET', 'POST'])
def category_list(request):
    category_type = request.GET.get('type')
    show_deleted = request.GET.get('show_deleted') == 'true'  # ✅

    if request.method == "POST":
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            category_instance = serializer.save()
            return Response(CategorySerializer(category_instance).data, status=201)
        return Response(serializer.errors, status=400)

    core_category_names = [c[0] for c in CORE_CATEGORIES]
    
    if show_deleted:
        categories = Category.objects.exclude(name__in=core_category_names)
    else:
        categories = Category.objects.filter(is_deleted=False).exclude(name__in=core_category_names)

    if category_type:  # Only filter if provided
        categories = categories.filter(category_type=category_type)

    return Response({
        "categories": CategorySerializer(categories, many=True).data,
        "core_categories": core_category_names
    })

@api_view(['POST'])
def category_restore(request, category_id):
    try:
        category = Category.objects.get(id=category_id)
        category.is_deleted = False
        category.save(update_fields=['is_deleted'])
        return Response({"message": "Category restored successfully"}, status=200)
    except Category.DoesNotExist:
        return Response({"error": "Category not found"}, status=404)

@api_view(['GET', 'PUT', 'DELETE'])
def category_detail(request, category_id):
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        return Response({"error": "Category not found"}, status=404)

    if request.method == "GET":
        return Response(CategorySerializer(category).data)

    elif request.method == "PUT":
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == "DELETE":
        if not category.is_deleted:
            # Soft delete
            category.is_deleted = True
            category.save(update_fields=['is_deleted'])
            return Response({"message": "Category marked as deleted"}, status=200)
        else:
            # Hard delete
            category.delete()
            return Response({"message": "Category permanently deleted"}, status=200)

# ---------------------- USER RELATED VIEWS ---------------------- #

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
# --------- SERVICE RELATED VIEWS --------- #

@api_view(["POST"])
def create_document(request):
    """
    Creates a new document if it doesn't already exist.
    Expected JSON:
    {
        "name": "Aadhar Card",
        "categories": ["Identity Proof"],
        "additional_details": "12-digit UID card"
    }
    """
    name = request.data.get("name")
    categories = request.data.get("categories", [])  # list of strings
    additional_details = request.data.get("additional_details", "")

    if not name:
        return Response({"error": "Document name is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Check if document already exists
    if Document.objects.filter(name__iexact=name.strip()).exists():
        return Response({"error": "Document already exists"}, status=status.HTTP_409_CONFLICT)

    # Create document
    document = Document.objects.create(
        name=name.strip(),
        additional_details=additional_details.strip() if additional_details else ""
    )

    # Add categories
    for category_name in categories:
        category_obj, _ = DocumentCategory.objects.get_or_create(name=category_name.strip())
        document.document_categories.add(category_obj)

    return Response({
        "id": document.id,
        "name": document.name,
        "additional_details": document.additional_details,
        "categories": [cat.name for cat in document.document_categories.all()],
        "created_at": document.created_at,
    }, status=status.HTTP_201_CREATED)

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer

    def get_queryset(self):
        qs = Document.objects.filter(is_deleted=False)
        service_id = self.request.query_params.get('service_id')
        if service_id:
            qs = qs.filter(servicedocumentrequirement__service_id=service_id)
        return qs.order_by('-created_at')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.save()
        return Response({"message": "Document deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], url_path='bulk')
    def bulk_create(self, request):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class ServiceDocumentRequirementViewSet(viewsets.ModelViewSet):
    queryset = ServiceDocumentRequirement.objects.all()
    serializer_class = ServiceDocumentRequirementSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        service_id = self.request.query_params.get('service_id')
        if service_id:
            qs = qs.filter(service_id=service_id)
        return qs
        
class ServiceListCreateView(generics.ListCreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        instance = self.get_queryset().get(pk=response.data['id'])
        full_data = self.get_serializer(instance).data
        return Response(full_data)

class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer

    def get_queryset(self):
        show_deleted = self.request.query_params.get('show_deleted', 'false').lower() == 'true'

        # For delete or restore actions, include all services
        if self.action in ['destroy', 'restore']:
            return Service.objects.all()

        if show_deleted:
            return Service.objects.filter(is_deleted=True).order_by('-id')

        return Service.objects.filter(is_deleted=False).order_by('-id')

    def perform_create(self, serializer):
        service = serializer.save()
        self._handle_documents(service, self.request.data.get('required_documents'))

    def perform_update(self, serializer):
        service = serializer.save()
        self._handle_documents(service, self.request.data.get('required_documents'))

    def _handle_documents(self, service, documents_data):
        if documents_data is not None:
            # Clear existing relations
            ServiceDocumentRequirement.objects.filter(service=service).delete()
            for doc_id in documents_data:
                ServiceDocumentRequirement.objects.create(
                    service=service,
                    document_id=doc_id
                )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # If it's already deleted, delete permanently
        if instance.is_deleted:
            instance.delete()
            return Response({"message": "Service permanently deleted"}, status=status.HTTP_200_OK)

        # Otherwise soft delete
        instance.is_deleted = True
        instance.save(update_fields=['is_deleted'])
        return Response({"message": "Service marked as deleted"}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        instance = self.get_object()
        instance.is_deleted = False
        instance.save(update_fields=['is_deleted'])
        return Response({"message": "Service restored successfully"}, status=status.HTTP_200_OK)
        
class SupportingDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = SupportingDocumentSerializer
    queryset = SupportingDocument.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        service_id = self.request.query_params.get("service")
        if service_id:
            queryset = queryset.filter(servicesupportingdocument__service_id=service_id).distinct()
        return queryset

class ServiceSupportingDocumentViewSet(viewsets.ModelViewSet):
    queryset = ServiceSupportingDocument.objects.all()
    serializer_class = ServiceSupportingDocumentSerializer

    @action(detail=False, methods=['post'], url_path='unlink')
    def unlink_document(self, request):
        service_id = request.data.get("service")
        doc_id = request.data.get("supporting_document_id")

        if not service_id or not doc_id:
            return Response(
                {"detail": "Missing service or document ID"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            link = ServiceSupportingDocument.objects.get(
                service_id=service_id,
                supporting_document_id=doc_id
            )
            link.delete()
            return Response(
                {"detail": "Unlinked successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except ServiceSupportingDocument.DoesNotExist:
            return Response(
                {"detail": "Link does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )
        
# ---------------------- ACCOUNTS RELATED VIEWS ---------------------- #

class AccountListView(APIView):
    def get(self, request, *args, **kwargs):
        show_deleted = request.query_params.get('show_deleted', 'false').lower() == 'true'
        if show_deleted:
            accounts = Account.objects.filter(is_deleted=True)
        else:
            accounts = Account.objects.filter(is_deleted=False)
        serializer = AccountSerializer(accounts, many=True)
        return Response(serializer.data)
    
class AccountViewSet(viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        show_deleted = self.request.query_params.get('show_deleted', 'false').lower() == 'true'
        if show_deleted:
            return Account.objects.filter(is_deleted=True)
        return Account.objects.filter(is_deleted=False)

    def destroy(self, request, *args, **kwargs):
        account = self.get_object()
        if account.is_deleted:
            account.delete()  # hard delete
            return Response({"success": True})
        return Response({"error": "Cannot delete active account"}, status=400)

@api_view(['POST'])
def account_restore(request, account_id):
    try:
        account = Account.objects.get(id=account_id, is_deleted=True)
        account.is_deleted = False
        account.save()
        return Response({"success": True})
    except Account.DoesNotExist:
        return Response({"error": "Account not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def account_hard_delete(request, account_id):
    try:
        account = Account.objects.get(id=account_id, is_deleted=True)
        account.delete()  # Permanently remove
        return Response({"success": True})
    except Account.DoesNotExist:
        return Response({"error": "Account not found"}, status=status.HTTP_404_NOT_FOUND)
    
# ---------------------- PDF RELATED VIEWS ---------------------- #

@api_view(['POST'])
def generate_pdf(request):
    data = request.data
    aadhaar = data.get("aadhaarNumber", "").strip()
    name = data.get("name", "").upper()

    # Aadhaar digit positioning
    start_x = 218  # Adjust starting X coordinate as needed
    y = 300.8        # Y-coordinate where Aadhaar number should be printed

    # ✅ Generate overlay PDF with Aadhaar number
    overlay_buffer = BytesIO()
    overlay_canvas = canvas.Canvas(overlay_buffer, pagesize=A4)

    overlay_canvas.setFont("Gotham", 11)

    name_start_x = 110  # Starting X position for name
    name_y = 676        # Y position for name
    name_gap = 8.5      # Horizontal spacing between characters — adjust as needed

    for index, char in enumerate(name):
        overlay_canvas.drawString(name_start_x + index * name_gap, name_y, char)

    # Draw Aadhaar number digit by digit
    aadhaar_gap = 10.5      # base gap between digits
    extra_block_gap = 10.7  # extra gap after every 4 digits

    x = start_x
    for index, digit in enumerate(aadhaar):
        overlay_canvas.drawString(x, y, digit)
        x += aadhaar_gap
        # Add extra space after 4th and 8th digit
        if (index + 1) % 4 == 0 and index != len(aadhaar) - 1:
            x += extra_block_gap

    overlay_canvas.save()
    overlay_buffer.seek(0)

    # ✅ Load original Aadhaar PDF form
    form_path = os.path.join("static", "forms", "enroll_form.pdf")  # Ensure correct path
    base_pdf = PdfReader(form_path)
    overlay_pdf = PdfReader(overlay_buffer)

    output = PdfWriter()
    first_page = base_pdf.pages[0]
    first_page.merge_page(overlay_pdf.pages[0])
    output.add_page(first_page)

    final_buffer = BytesIO()
    output.write(final_buffer)
    final_buffer.seek(0)

    return FileResponse(final_buffer, as_attachment=True, filename="aadhaar_form_filled.pdf")
