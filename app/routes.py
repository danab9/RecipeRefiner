# API routes will go here

from flask import Blueprint, jsonify, request

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


    # Simulate a response
    response = {
        'response': f'You asked: {user_input}',
        'status': 'success'
    }

    # return the response as JSON
    return jsonify(response)
