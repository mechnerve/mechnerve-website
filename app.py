from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

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
    try:
        data = request.json
        print(f"📧 Contact form submission received:")
        print(f"   Name: {data.get('name', 'Not provided')}")
        print(f"   Email: {data.get('email', 'Not provided')}")
        print(f"   Subject: {data.get('subject', 'Not provided')}")
        print(f"   Service: {data.get('service', 'Not provided')}")
        print(f"   Message: {data.get('message', 'Not provided')[:100]}...")
        
        # In production, you would:
        # 1. Validate the data
        # 2. Send an email using SMTP
        # 3. Store in database if needed
        # 4. Integrate with a CRM
        
        return jsonify({
            "success": True, 
            "message": "Thank you for your message! We'll get back to you within 24 hours."
        })
        
    except Exception as e:
        print(f"❌ Error processing contact form: {e}")
        return jsonify({
            "success": False,
            "message": "An error occurred. Please try again or email us directly."
        }), 500

@app.route("/health")
def health():
    return "OK", 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
