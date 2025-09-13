from typing import Dict # for compatibility with python<3.9
from recipe_scrapers import scrape_me # , scrape_html - more advanced
from recipe_scrapers import AbstractScraper
import recipe_scrapers

def get_title(scraper: AbstractScraper) -> str:
    """Extract the title of a recipe from a scraper object.

    Args:
        scraper (AbstractScraper): The recipe scraper instance.

    Returns:
        str: The recipe title.
    """
    return scraper.title()

def get_ingredients(scraper: AbstractScraper) -> str:
    """Extract the ingredients of a recipe as a comma-separated string.

    Args:
        scraper (AbstractScraper): The recipe scraper instance.

    Returns:
        str: Ingredients joined as a single string.
    """
    return ', '.join(scraper.ingredients())


def get_instructions(scraper: AbstractScraper) -> str:
    """Extract the cooking instructions of a recipe.

    Args:
        scraper (AbstractScraper): The recipe scraper instance.

    Returns:
        str: The recipe instructions as a single string.
    """
    return scraper.instructions()

def scrape_recipe(url: str) -> Dict[str, str]:
    """Scrape a recipe from a given URL and return its main components.

    Args:
        url (str): The URL of the recipe page.

    Returns:
        dict[str, str]: A dictionary containing 'title', 'ingredients', and 'instructions'.
                        If the website is not supported, all values are empty strings.
    """
    recipe_dict = {
        "title":'',
        "ingredients": '',
        "instructions": ''
        }
    try:
        scraper = scrape_me(url)
        recipe_dict["title"] = get_title(scraper)
        recipe_dict["ingredients"] = get_ingredients(scraper)
        recipe_dict["instructions"] = get_instructions(scraper)
    except recipe_scrapers._exceptions.WebsiteNotImplementedError:
        # website not supported 
        # TODO message?
        pass 
    finally:
        return recipe_dict
    



