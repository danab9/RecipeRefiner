from django.shortcuts import render
from django.http import JsonResponse
import json

# from .forms import URLFrom

from .services.recipe_processor import scrape_recipe

def get_url(request):
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
    else:  # GET
        return JsonResponse({}) # TODO

