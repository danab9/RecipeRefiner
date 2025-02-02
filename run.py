from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)  # Start the Flask app in debug mode

