import os

from flask import Flask, request, jsonify

def create_app():
    app = Flask(__name__)  # Create Flask app instance
    
    @app.route("/") # decorator. maps URL to the function below it 
    def home():
        return "Hi! This is the home page" # This is printed out in the screen 
    
    @app.route('/ask', methods=['POST'])
    def ask_gpt():
        user_input = request.json.get("input")  # Get the 'input' field from the JSON body
        response = {
        "response": f"You asked: {user_input}",  # Simulate a GPT response for now
        "status": "success"
        }
        return jsonify(response)  # Return a JSON response
        
    return app 
