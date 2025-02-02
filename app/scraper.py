import requests
from bs4 import BeautifulSoup

def fetch_html(url):
    """
    Fetch the HTML content of a given URL.
    """
    try:
         # Pretend we are a real browser to avoid getting blocked
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Automatically raises an error for bad HTTP responses

        return response.text  # Returns the full HTML as a string
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL: {e}")  # Log the error
        return f"Error fetching URL: {e}"  # Return error message as string (instead of None)
    

def clean_html(html):
    """
    Uses BeautifulSoup to remove unnecessary elements from the HTML.
    """
    soup = BeautifulSoup(html, "html.parser")

    # Remove script, style, and ads
    for tag in soup(["script", "style", "header", "footer", "nav", "aside"]):
        tag.decompose()

    # Get the most relevant content (recipe is usually in <article> or <main>)
    main_content = soup.find(["article", "main", "div"], class_=lambda x: x and "recipe" in x.lower())

    return main_content.get_text("\n", strip=True) if main_content else soup.get_text("\n", strip=True)