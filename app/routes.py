# API routes will go here
from flask import Blueprint, jsonify, request
from dotenv import load_dotenv
import os
import openai
from app.scraper import fetch_html  # Import the fetch function

# Load environment variables from .env file
load_dotenv()
# Access the API key from environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")
 
# create a Blueprint for the API routes
api = Blueprint('api', __name__)

# Define a simple route that responds to GET requests
@api.route('/hello', methods=['GET']) # When someone accesses /hello, the hello_world() function will be called.
def hello_world():
    return jsonify({"message": "Hello, World!"})

@api.route('/ask', methods=['POST'])
def ask_gpt():
    # Get the input data from the request body (expects JSON)
    user_input = request.json.get('input')

    # Error handling
    # if input missing: return 400 Bad Request Error
    if not user_input:
        return jsonify({'error': 'No input provided'}), 400

    try:
        # Generate a response using the Hugging Face GPT-neo model
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo", # Use 'gpt-3.5-turbo or 'gpt-4' based on needs
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_input}
            ],
            max_tokens=150, # Adjust for length of response
            temperature=0.7 # Adjust for creativity in the response
        )
        # Extract the generated text fro the response 
        gpt_response = response.choices[0].message.content #.strip()?

        # Return the GPT response as JSON
        return jsonify({'response': gpt_response, 'status': 'success'})
    
    except Exception as e:
        # if something goes wrong, return a 500 error with the error message
        return jsonify({'error':str(e)}), 500


@api.route('/fetch', methods=['POST'])
def fetch_recipe_html():
    """
    Fetch raw HTML from a given recipe URL
    """
    data = request.json
    url = data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400
    
    html_content = fetch_html(url)

    if 'Error fetching' in html_content:
        return jsonify({'error': html_content}), 500

    return jsonify({'html': html_content})