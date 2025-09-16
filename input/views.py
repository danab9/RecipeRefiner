from django.http import JsonResponse, HttpRequest
from django.views.decorators.http import require_POST
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError

import json

# from .forms import URLFrom

from .services.recipe_processor import scrape_recipe

@require_POST
def get_url(request: HttpRequest) -> JsonResponse:
    """Handles POST requests to extract a recipe from a given URL.

    Args:
        request (HttpRequest): The HTTP request containing a JSON body with a 'url' field.

    Returns:
        JsonResponse: A JSON response with the extracted recipe data.
    """
    try:
        body = json.loads(request.body)
        url_string = body.get("url")
    
        # Check URL validity
        validate_url = URLValidator()
        try:
            validate_url(url_string)
        except ValidationError:
            return JsonResponse({"error": "Invalid URL input"}, status=400)

        
        data = scrape_recipe(url_string)
        return JsonResponse({"recipe": data})
    
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

