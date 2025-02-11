import requests
from bs4 import BeautifulSoup
import json

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
    Extracts the page title and visible text content while removing unnecessary elements.
    """
    soup = BeautifulSoup(html, "html.parser")
    
    if soup.head:
        soup.head.extract()

    # ✅ Remove unnecessary elements (ads, scripts, styles, videos, popups)
    sections_to_remove = [
        "script", "style", "header", "footer", "nav", "aside", "iframe", "video", "form", 
        "noscript", "svg", "button", "img", "figure", "input", "picture", "source", "ylplaceholder",
        "comment", "comments", "related-recipes", "sidebar", "social", "profile-icons",
        "subscribe", "search", "author", "next_post", "previous_post", "rating", "rating-stars", "meta"
    ]
    for tag in soup(sections_to_remove):
        tag.extract()

    # ✅ Remove divs and sections that contain common ad/pop-up identifiers
    ad_keywords = ["ad", "sponsor", "promo", "banner", "advert", "subscribe", "overlay", "popup", "modal", "cta"]
    for ad in soup.find_all(class_=lambda x: x and any(keyword in x.lower() for keyword in ad_keywords)):
        ad.extract()
    
    # ✅ Remove all empty divs after removing content
    for empty_div in soup.find_all("div"):
        if not empty_div.get_text(strip=True):
            empty_div.extract()

    

    # ✅ Extract the title
    title = soup.find(["h1", "h2"])
    title_text = title.get_text(strip=True) if title else "Title Not Found"

    # ✅ Save the modified HTML to a file
    with open("modified_page.html", "w", encoding="utf-8") as f:
        f.write(str(soup))
        
    # ✅ Extract only the visible text (after cleanup)
    text_content = soup.get_text("\n", strip=True)  # Extracts all text with line breaks

    return f"{title_text}\n\n{text_content}"

html = fetch_html("https://www.inspiredtaste.net/25753/carrot-cake-recipe/")
cleaned_text = clean_html(html)

print(cleaned_text)