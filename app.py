from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

# Add caching headers
@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/api/contact", methods=["POST"])
def contact_api():
    # This would handle contact form submissions
    data = request.json
    # Add email sending logic here
    return jsonify({"success": True, "message": "Message received!"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
