import pytest
from app.scraper import fetch_html, clean_html

def test_fetch_html():
    """Test if fetch_html() returns a string with HTML content"""
    url = "https://www.inspiredtaste.net/25753/carrot-cake-recipe/"
    html = fetch_html(url)

    assert isinstance(html, str), "fetch_html() should return a string"
    assert "<html" in html.lower(),  "HTML content should contain a <html> tag"
