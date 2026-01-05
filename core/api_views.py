from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .forms import ContactForm
from .views import PACKAGE_DATA
import json

def get_packages(request):
    return JsonResponse(PACKAGE_DATA)

@csrf_exempt
@require_POST
def contact_api(request):
    try:
        data = json.loads(request.body)
        form = ContactForm(data)
        if form.is_valid():
            form.save()
            return JsonResponse({"status": "success", "message": "Message sent successfully"})
        else:
            return JsonResponse({"status": "error", "errors": form.errors}, status=400)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
