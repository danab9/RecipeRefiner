from flask import Flask, request, jsonify

def create_app():
    """
    Constructor of the factory pattern.
    Creates and returns a Flask app instance.
    """
    app = Flask(__name__)  # Create Flask app instance
    
    # import the API routes
    from .routes import api
    app.register_blueprint(api)

    # @app.route("/") # decorator. maps URL to the function below it 
    # def home():
    #     return "Hi! This is the home page" # This is printed out in the screen 
    
    # @app.route('/ask', methods=['POST'])
    # def ask_gpt():
    #     user_input = request.json.get("input")  # Get the 'input' field from the JSON body
    #     response = {
    #     "response": f"You asked: {user_input}",  # Simulate a GPT response for now
    #     "status": "success"
    #     }
    #     return jsonify(response)  # Return a JSON response
        
    return app 
