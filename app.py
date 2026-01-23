from flask import Flask, render_template, request, jsonify
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
from datetime import datetime

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

def send_email_via_smtp(data):
    """Send email using SMTP directly"""
    try:
        # Email configuration
        sender_email = "mechnervesolutions@gmail.com"
        receiver_email = "mechnervesolutions@gmail.com"  # Send to yourself
        password = os.environ.get("EMAIL_PASSWORD", "")  # Use app password for Gmail
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"New Contact: {data.get('subject', 'No Subject')}"
        msg['From'] = f"MechNerve Website <{sender_email}>"
        msg['To'] = receiver_email
        msg['Reply-To'] = data.get('email', '')
        
        # Plain text version
        text = f"""
New Contact Form Submission

Name: {data.get('name', 'Not provided')}
Email: {data.get('email', 'Not provided')}
Subject: {data.get('subject', 'Not provided')}
Service: {data.get('service', 'Not provided')}

Message:
{data.get('message', 'Not provided')}

---
Sent from MechNerve Solutions Website
        """
        
        # HTML version
        html = f"""
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #38bdf8, #0ea5e9); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h2>New Contact Form Submission</h2>
            <p>MechNerve Solutions Website</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="margin-bottom: 15px;">
                <strong style="color: #38bdf8;">👤 Name:</strong><br>
                <div style="padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #38bdf8;">
                    {data.get('name', 'Not provided')}
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong style="color: #38bdf8;">📧 Email:</strong><br>
                <div style="padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #38bdf8;">
                    {data.get('email', 'Not provided')}
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong style="color: #38bdf8;">📋 Subject:</strong><br>
                <div style="padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #38bdf8;">
                    {data.get('subject', 'Not provided')}
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong style="color: #38bdf8;">🔧 Service:</strong><br>
                <div style="padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #38bdf8;">
                    {data.get('service', 'Not provided')}
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong style="color: #38bdf8;">💬 Message:</strong><br>
                <div style="padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #38bdf8; white-space: pre-wrap;">
                    {data.get('message', 'Not provided')}
                </div>
            </div>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee; font-size: 12px; color: #666; text-align: center;">
            <p>© 2026 MechNerve Solutions. Hyderabad, India.</p>
        </div>
    </div>
</body>
</html>
        """
        
        # Attach both versions
        part1 = MIMEText(text, 'plain')
        part2 = MIMEText(html, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email using Gmail SMTP
        if password:  # Only try to send if password is available
            with smtplib.SMTP('smtp.gmail.com', 587) as server:
                server.starttls()
                server.login(sender_email, password)
                server.send_message(msg)
                print("✅ Email sent successfully via SMTP")
                return True
        else:
            print("⚠️ Email password not configured. Saving to file instead.")
            return False
            
    except Exception as e:
        print(f"❌ SMTP Error: {str(e)}")
        return False

def save_contact_to_file(data):
    """Save contact form data to JSON file as backup"""
    try:
        filename = "contact_submissions.json"
        
        # Prepare the entry
        entry = {
            "timestamp": datetime.now().isoformat(),
            "data": data
        }
        
        # Read existing data or create new list
        try:
            with open(filename, 'r') as f:
                existing_data = json.load(f)
                if not isinstance(existing_data, list):
                    existing_data = []
        except (FileNotFoundError, json.JSONDecodeError):
            existing_data = []
        
        # Add new entry
        existing_data.append(entry)
        
        # Save back to file
        with open(filename, 'w') as f:
            json.dump(existing_data, f, indent=2, default=str)
        
        print(f"✅ Contact saved to {filename}")
        return True
        
    except Exception as e:
        print(f"⚠️ File save error: {str(e)}")
        return False

def log_contact_to_console(data):
    """Log contact data to console (for debugging)"""
    print("\n" + "="*50)
    print("📧 CONTACT FORM SUBMISSION RECEIVED")
    print("="*50)
    print(f"Name: {data.get('name', 'N/A')}")
    print(f"Email: {data.get('email', 'N/A')}")
    print(f"Subject: {data.get('subject', 'N/A')}")
    print(f"Service: {data.get('service', 'N/A')}")
    print(f"Message: {data.get('message', 'N/A')[:200]}...")
    print("="*50 + "\n")
    return True

@app.route("/api/contact", methods=["POST"])
def contact_api():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['name', 'email', 'subject', 'message']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    "success": False,
                    "message": f"Please provide {field.replace('_', ' ')}"
                }), 400
        
        # Clean the data
        cleaned_data = {k: str(v).strip() for k, v in data.items()}
        
        # Log to console (always works)
        log_contact_to_console(cleaned_data)
        
        # Try to send email
        email_sent = send_email_via_smtp(cleaned_data)
        
        # Save to file as backup
        file_saved = save_contact_to_file(cleaned_data)
        
        if email_sent:
            message = "Thank you for your message! We've received it and will get back to you within 24 hours."
        elif file_saved:
            message = "Thank you for your message! We've saved your inquiry. Please also email us directly at mechnervesolutions@gmail.com for faster response."
        else:
            message = "Thank you for contacting us! Please email us directly at mechnervesolutions@gmail.com"
        
        return jsonify({
            "success": True, 
            "message": message
        })
        
    except Exception as e:
        print(f"❌ Contact API Error: {str(e)}")
        return jsonify({
            "success": False,
            "message": "An error occurred. Please email us directly at mechnervesolutions@gmail.com"
        }), 500

@app.route("/health")
def health():
    return "OK", 200

@app.route("/api/submissions", methods=["GET"])
def get_submissions():
    """API endpoint to view saved submissions (for debugging)"""
    try:
        with open("contact_submissions.json", "r") as f:
            data = json.load(f)
        return jsonify({"success": True, "count": len(data), "submissions": data})
    except FileNotFoundError:
        return jsonify({"success": True, "count": 0, "submissions": []})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
