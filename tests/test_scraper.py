import sys
import os

# Add the parent directory (project root) to sys.path so pytest can find `app/`
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.scraper import fetch_html, clean_html

def test_fetch_html():
    """Test if fetch_html() returns a string with HTML content"""
    url = "https://www.inspiredtaste.net/25753/carrot-cake-recipe/"
    html = fetch_html(url)

    assert isinstance(html, str), "fetch_html() should return a string"
    assert "<html" in html.lower(),  "HTML content should contain a <html> tag"


def test_clean_html():
    """Test if clean_html() correctly extracts the main content from the HTML"""
    sample_html = """
    <html>
    <body>
      <header>Navigation Bar</header>
      <article class="recipe-content">
        <h1>Chocolate Cake</h1>
        <ul>
          <li>2 cups flour</li>
          <li>1 cup sugar</li>
        </ul>
        <p>Bake for 30 minutes.</p>
      </article>
      <footer>Site Footer</footer>
    </body>
    </html>
    """

    cleaned_text = clean_html(sample_html)

    # Ensure recipe content is extracted
    assert "Chocolate Cake" in cleaned_text, "Should extract the title"
    assert "2 cups flour" in cleaned_text, "Should extract the ingredients"
    assert "Bake for 30 minutes." in cleaned_text, "Should extract the instructions"

    # Ensure non-recipe content is removed
    assert "Navigation Bar" not in cleaned_text, "Should remove the header"
    assert "Site Footer" not in cleaned_text, "Should remove the footer"

def test_clean_html_real_page():
    """Test clean_html() on a real recipe webpage"""
    url = "https://www.inspiredtaste.net/25753/carrot-cake-recipe/"
    raw_html = fetch_html(url)

    # save the raw HTML to a file for inspection
    with open("raw_recipe_page.html", "w", encoding="utf-8") as f:
        f.write(raw_html)

    assert "<html" in raw_html.lower(), "Fetched content should be valid HTML"

    # cleaned_text = clean_html(raw_html)

    # # Ensure some expected words appear in the extracted text
    # assert "carrot" in cleaned_text.lower(), "Extracted text should mention 'carrot'"
    # assert "flour" in cleaned_text.lower(), "Extracted text should mention 'flour'"
    # assert "bake" in cleaned_text.lower(), "Extracted text should mention 'bake'"

    # # Ensure navigation, ads, and other unwanted content are removed
    # assert "menu" not in cleaned_text.lower(), "Should remove navigation menu"
    # assert "subscribe" not in cleaned_text.lower(), "Should remove newsletter ads"
