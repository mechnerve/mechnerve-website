from flask import Flask, render_template, request, jsonify
from flask_caching import Cache
import os

app = Flask(__name__)
app.config['CACHE_TYPE'] = 'simple'
app.config['CACHE_DEFAULT_TIMEOUT'] = 300
cache = Cache(app)

# Add caching headers
@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'public, max-age=300'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response

@app.route("/")
@cache.cached(timeout=300)
def home():
    return render_template("index.html")

@app.route("/about")
@cache.cached(timeout=300)
def about():
    return render_template("about.html")

@app.route("/contact")
@cache.cached(timeout=300)
def contact():
    return render_template("contact.html")

@app.route("/api/contact", methods=["POST"])
def contact_api():
    # This would handle contact form submissions
    data = request.json
    # Add email sending logic here
    return jsonify({"success": True, "message": "Message received!"})

# Health check endpoint for Render
@app.route("/health")
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
