from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Category

@csrf_exempt
def category_list(request):
    if request.method == "GET":
        categories = list(Category.objects.values())
        return JsonResponse({"categories": categories}, safe=False)

    elif request.method == "POST":
        data = json.loads(request.body)
        category = Category.objects.create(name=data["name"], description=data.get("description", ""))
        return JsonResponse({"id": category.id, "name": category.name, "description": category.description})

@csrf_exempt
def category_detail(request, category_id):
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        return JsonResponse({"error": "Category not found"}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        category.name = data.get("name", category.name)
        category.description = data.get("description", category.description)
        category.save()
        return JsonResponse({"id": category.id, "name": category.name, "description": category.description})

    elif request.method == "DELETE":
        category.delete()
        return JsonResponse({"message": "Category deleted successfully"})
