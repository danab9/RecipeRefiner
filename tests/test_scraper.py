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

