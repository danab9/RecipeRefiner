from django.http import JsonResponse, HttpRequest
from django.views.decorators.http import require_POST
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError

# auth
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login

import json

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

        # process recipe for everyone
        data = scrape_recipe(url_string)

        # if user is authenticated save history
        ## TODO - save history
        
        # return processed recipe for all users
        return JsonResponse({"recipe": data})
    
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

@require_POST
def register_user(request: HttpRequest) -> JsonResponse:
    """Register a new user.

    Expects JSON: {"username": str, "password": str, "email": str (optional)}

    Returns JsonResponse indicating success or failure of authentication.
    """
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    username = body.get("username")
    password = body.get("password")
    email = body.get("email") # optional

    # validate username was given
    if not username:
        return JsonResponse({"error": "Username required"}, status=400)
    if not password:
        return JsonResponse({"error": "Password required"}, status=400)
    # Check if username already exists
    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Username already exists"}, status=400)
    # Check if email already exists
    if email and User.objects.filter(email=email).exists():
        return JsonResponse({"error": "Email already exists"}, status=400)
    try:
        new_user = User.objects.create_user(username, email, password)
        login(request, new_user) # automatic login in registration
        return JsonResponse({
        "message": "Registration successful", 
        "user_id": new_user.id,
        "username": new_user.username
        })
    except Exception as e:
        return JsonResponse({"error": "Registration failed"}, status=500)

@require_POST
def login_user(request: HttpRequest) -> JsonResponse:
    """Handle user login.

    Expects JSON: {"username": str, "password": str}

    Returns:
        JsonResponse: A JSON response indicating success or failure of authentication.
    """
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    # get user credentials
    username = body.get("username")
    password = body.get("password")
    
    # validate credentials were provided
    if not username:
        return JsonResponse({"error": "Username required"}, status=400)
    if not password:
        return JsonResponse({"error": "Password required"}, status=400)

    user = authenticate(username=username, password=password)
    if user is not None:
        # user is authenticated
        login(request, user)
        return JsonResponse({
        "message": "Authentication successful", 
        "user_id": user.id,
        "username": user.username
        })
    else:
        return JsonResponse({"error": "Invalid username or password."}, status=401)