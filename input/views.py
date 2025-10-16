from django.http import JsonResponse, HttpRequest
from django.views.decorators.http import require_POST, require_GET
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
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
from .serializers import RecipeHistorySerializer

# rest framework
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


@api_view(["POST"])
def register_user(request):
    """Register a new user.

    Expects JSON: {"username": str, "password": str, "email": str (optional)}

    Returns Response indicating success or failure of authentication.
    """

    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email")  # optional field

    # validate username was given
    if not username:
        return Response(
            {"error": "Username required"}, status=status.HTTP_400_BAD_REQUEST
        )
    if not password:
        return Response(
            {"error": "Password required"}, status=status.HTTP_400_BAD_REQUEST
        )
    # Check if username already exists
    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST
        )
    # Check if email already exists
    if email and User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST
        )
    try:
        new_user = User.objects.create_user(username, email, password)
        login(request, new_user)  # automatic login in registration
        return Response(
            {
                "message": "Registration successful",
                "user_id": new_user.id,
                "username": new_user.username,
            },
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return Response(
            {"error": "Registration failed"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def login_user(request):
    """Handle user login.

    Expects JSON: {"username": str, "password": str}

    Returns:
        Response: A DRF Response indicating success or failure of authentication.
    """
    # get user credentials
    username = request.data.get("username")
    password = request.data.get("password")

    # validate credentials were provided
    if not username:
        return Response(
            {"error": "Username required"}, status=status.HTTP_400_BAD_REQUEST
        )
    if not password:
        return Response(
            {"error": "Password required"}, status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)
    if user is not None:
        # user is authenticated
        login(request, user)
        return Response(
            {
                "message": "Authentication successful",
                "user_id": user.id,
                "username": user.username,
            },
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {"error": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )


@api_view(["POST"])
def logout_user(request):
    """Logout user

    Args:
        request: The HTTP request object.

    Returns:
        Response: A DRF Response indicating logout status.
    """
    if not request.user.is_authenticated:
        return Response(
            {"error": "No user logged in"}, status=status.HTTP_400_BAD_REQUEST
        )
    logout(request)
    return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)


@api_view(["POST"])
def get_url(request):
    """Handles POST requests to extract a recipe from a given URL.

    Args:
        request (HttpRequest): The HTTP request containing a JSON body with a 'url' field.

    Returns:
        Response: A DRF Response with the extracted recipe data.
    """

    url_string = request.data.get("url")
    # Check URL validity
    validate_url = URLValidator()
    try:
        validate_url(url_string)
    except ValidationError:
        return Response(
            {"error": "Invalid URL input"}, status=status.HTTP_400_BAD_REQUEST
        )

    # process recipe for everyone
    data = scrape_recipe(url_string)

    # if user is authenticated save history
    if request.user.is_authenticated:
        save_to_history(request.user, url_string, data)

    # return processed recipe for all users
    return Response({"recipe": data}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_history(request):
    """Retrieve user's recipe history."""
    # login required - taken care of by permission classes decorator

    # Get user's recipes as QuerySet
    user_recipes_qs = RecipeHistory.objects.filter(user=request.user).order_by(
        "-date_time"
    )
    serializer = RecipeHistorySerializer(user_recipes_qs, many=True)
    return Response({"recipes": serializer.data}, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_recipe(request, recipe_id):
    """Handles the deletion of a recipe from user's history
    based on the provided recipe ID in the request.
    User must be authenticated.

    recipe_id: recipe_id to delete from the url
    """
    try:
        # delete instance - allows later expansion, for custom deletion.
        recipe = RecipeHistory.objects.get(id=recipe_id, user=request.user)
        recipe.delete()
    except ObjectDoesNotExist:
        return Response({"error": "Recipe not found"}, status=status.HTTP_404_NOT_FOUND)

    return Response(
        {"message": "Deletion successful"}, status=status.HTTP_204_NO_CONTENT
    )
