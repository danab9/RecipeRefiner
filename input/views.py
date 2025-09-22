from django.http import JsonResponse, HttpRequest
from django.views.decorators.http import require_POST, require_GET
from django.views.decorators.http import require_http_methods
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError, ObjectDoesNotExist
# auth
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout

import json
# local code
from .services.recipe_processor import scrape_recipe
from .services.history_service import save_to_history
from .models import RecipeHistory

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
        return JsonResponse({"error": "Invalid username or password."}, status=401)\

@require_POST
def logout_user(request: HttpRequest) -> JsonResponse:
    """Logout user

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        JsonResponse: A JSON response indicating logout status.
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "No user logged in"}, status=400)
    
    logout(request)
    return JsonResponse({"message": "Logout successful"})
    
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
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
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
    if request.user.is_authenticated:
        save_to_history(request.user, url_string, data)
        
    # return processed recipe for all users
    return JsonResponse({"recipe": data})
    
@require_GET
def get_user_history(request: HttpRequest) -> JsonResponse:
    """Handles user's recipes history retrieval.

    Args:
        request (HttpRequest): The HTTP request object containing user information.

    Returns:
        JsonResponse: A JSON response containing a list of the user's recipe history.
    """
    # login required
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    # Get user's recipes as QuerySet
    user_recipes_qs = RecipeHistory.objects.filter(user=request.user).order_by('-date_time') 
    
    # Convert QuerySet to list of dictionaries
    recipes_data = []
    for recipe in user_recipes_qs:
        recipes_data.append({
            'id': recipe.id,
            'url': recipe.url,
            'title': recipe.title,
            'ingredients': recipe.ingredients,
            'instructions': recipe.instructions,
            'date_time': recipe.date_time.isoformat() # Convert datetime to string
        })
    
    return JsonResponse({'recipes': recipes_data})

@require_http_methods(['DELETE'])
def delete_recipe(request: HttpRequest) -> JsonResponse:
    """Handles the deletion of a recipe from user's history 
    based on the provided recipe ID in the request. 
    User must be authenticated.
    Args:
        request (HttpRequest): The HTTP request object containing 'recipe_id', 
                               the id of the recipe to delete.
    Returns:
        JsonResponse: A JSON response indicating the result of the deletion operation.
    """
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    recipe_id = body.get("recipe_id")
    if recipe_id is None: # can be 0! = > can't user `if not recipe_id`! 
            return JsonResponse({"error": "recipe_id required"}, status=400)
    
    # make sure user is authenticated
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    try:
        # delete instance - allows later expansion, for custom deletion. 
        recipe = RecipeHistory.objects.get(id=recipe_id, user=request.user) 
        recipe.delete()
    except ObjectDoesNotExist:
        return JsonResponse({"error": "Recipe not found"}, status=404)

    return JsonResponse({"message": "Deletion successful"}, status=200)

