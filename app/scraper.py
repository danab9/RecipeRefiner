import requests
from bs4 import BeautifulSoup

def fetch_html(url):
    """
    Fetches the HTML content of a given URL
    """
    try:
        headers = {"User-Agent": "Mozilla/5.0"}  # Helps avoid getting blocked
        response = requests.get(url, headers=headers. timeout=10)
        response.raise_for_status() # Raise an exception for bad responses (4xx, 5xx)
    except requests.exceptions.RequestException as e:
        return f"Error feteching URL: {e}"