from flask import Flask
from routes.youtube_routes import youtube_bp

app = Flask(__name__)

# Register blueprints
app.register_blueprint(youtube_bp, url_prefix='/api/youtube')

if __name__ == '__main__':
    app.run(debug=True)
