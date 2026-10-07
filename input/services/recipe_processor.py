from typing import Dict # for compatibility with python<3.9
from recipe_scrapers import scrape_me # , scrape_html - more advanced
from recipe_scrapers import AbstractScraper
from recipe_scrapers._exceptions import WebsiteNotImplementedError
from recipe_scrapers._exceptions import RecipeScrapersExceptions


class RecipeExtractionError(Exception):
    """Raised when a recipe can't be scraped. 
    Caller (views.get_url) should map this to a 4xx response."""
    pass


def get_title(scraper: AbstractScraper) -> str:
    """Extract the title of a recipe from a scraper object.

    Args:
        scraper (AbstractScraper): The recipe scraper instance.

    Returns:
        str: The recipe title.
    """
    return scraper.title()

def get_ingredients(scraper: AbstractScraper, as_str=False) -> str | list[str]:
    """Extract the ingredients of a recipe.

    Args:
        scraper (AbstractScraper): The recipe scraper instance.
        as_str (bool): If True, join ingredients into a single comma-separated string.

    Returns:
        str | list[str]: Ingredients as a joined string if as_str, else a list of strings.
    """
    if as_str:
        return ', '.join(scraper.ingredients())
    else:
        return scraper.ingredients()


def get_instructions(scraper: AbstractScraper) -> str:
    """Extract the cooking instructions of a recipe.

    Args:
        scraper (AbstractScraper): The recipe scraper instance.

    Returns:
        str: The recipe instructions as a single string.
    """
    return scraper.instructions()

def scrape_recipe(url: str) -> dict:
    """Scrape a recipe from a given URL and return its main components.

    Args:
        url (str): The URL of the recipe page. Assuming valid URL

    Returns:
        dict[str, str | list]: A dictionary containing 'title', 'ingredients', and 'instructions'.

    Raises:
        RecipeExtractionError: If the site is unsupported or the recipe can't be extracted.
    """
    recipe_dict = {
        "title":'',
        "ingredients": [],
        "instructions": ''
        }
    try:
        scraper = scrape_me(url)
        recipe_dict["title"] = get_title(scraper)
        recipe_dict["ingredients"] = get_ingredients(scraper, as_str=False) # list of ingredients
        recipe_dict["instructions"] = get_instructions(scraper)
    except WebsiteNotImplementedError as e:
        # website not supported
        raise RecipeExtractionError("This site isn't supported yet.") from e
    except RecipeScrapersExceptions as e:
        # general failure while scraping
        raise RecipeExtractionError("Couldn't extract a recipe from this page.") from e

    return recipe_dict
    



