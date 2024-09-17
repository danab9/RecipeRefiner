from flask import Flask, request, jsonify

def create_app():
    """
    Constructor of the factory pattern.
    Creates and returns a Flask app instance.
    """
    app = Flask(__name__)  # Create Flask app instance
    
    # import the API routes
    from .routes import api
    app.register_blueprint(api) # Register the API routes. Flask Blueprint helps organize routes into modular components.

    return app 
