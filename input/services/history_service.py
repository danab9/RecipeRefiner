from ..models import RecipeHistory
from django.contrib.auth.models import User
from django.utils import timezone


def save_to_history(user: User, url: str, recipe_data: dict) -> None:
    """Saves a recipe to the user's history (bounded history list), maintaining a maximum of 20 recent recipes.

        user (User): The user for whom the recipe history is being updated.
        url (str): The URL of the recipe to be saved.
        recipe_data (dict): A dictionary containing recipe details such as 'title', 'ingredients', and 'instructions'.

    Returns:
        The recipe object and if created (not created means updated)
    """
    # save recipe to history
    # handle the 20 recipe limit logic
    current_count = RecipeHistory.objects.filter(user=user).count()

    # Check if recipe url already in history

    # If at limit, delete the oldest recipe
    if current_count >= 20:  # TODO limit not hardcoded
        oldest_recipe = (
            RecipeHistory.objects.filter(user=user).order_by("date_time").first()
        )
        oldest_recipe.delete()

    # Create the new recipe, unless already exists for user
    recipe, created = RecipeHistory.objects.get_or_create(
        user=user,
        url=url,
        defaults={  # non-unique values
            "title": recipe_data.get("title", ""),
            "ingredients": recipe_data.get("ingredients", []),
            "instructions": recipe_data.get("instructions", ""),
        },
    )

    if not created:
        # URL already exists for this user.
        # Update recipe and time stamp
        recipe.title = recipe_data.get("title", "")
        recipe.ingredients = recipe_data.get("ingredients", [])
        recipe.instructions = recipe_data.get("instructions", "")
        recipe.date_time = timezone.now()
        recipe.save()

    return recipe, created
