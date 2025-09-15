from django.http import JsonResponse, HttpRequest
import json

# from .forms import URLFrom

from .services.recipe_processor import scrape_recipe

def get_url(request: HttpRequest) -> JsonResponse:
    if request.method == "POST":
        try:
            body = json.load(request.body)
            url = body.get("url")
            if not url:
                return JsonResponse({"error": "Miising 'url' field"}, status=400)

            data = scrape_recipe(url)
            return JsonResponse({{"recipe": data}})
        
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
    # TODO: Do i need to take care of GET too? 
