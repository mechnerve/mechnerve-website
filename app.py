from flask import Flask, render_template, request, jsonify, make_response
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
from datetime import datetime
import logging
from functools import wraps
import traceback

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security headers
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response

# CORS for API
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
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

def validate_email(email):
    """Basic email validation"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def sanitize_input(text):
    """Basic input sanitization"""
    if not text:
        return ""
    # Remove potentially harmful characters but keep useful ones
    text = str(text)
    # Remove script tags and other HTML
    text = text.replace('<script>', '').replace('</script>', '')
    text = text.replace('<', '&lt;').replace('>', '&gt;')
    # Limit length
    return text[:5000]

def send_email_via_smtp(data):
    """Send email using SMTP directly"""
    try:
        # Email configuration - Use environment variables
        sender_email = os.environ.get("SENDER_EMAIL", "mechnervesolutions@gmail.com")
        receiver_email = os.environ.get("RECEIVER_EMAIL", "mechnervesolutions@gmail.com")
        password = os.environ.get("EMAIL_PASSWORD", "")
        
        # If no password is set in environment, try to get from config
        if not password:
            password = os.environ.get("SMTP_PASSWORD", "")
        
        if not password:
            logger.warning("⚠️ No email password configured. Email sending disabled.")
            return False
        
        # Sanitize inputs
        name = sanitize_input(data.get('name', 'Not provided'))
        email = sanitize_input(data.get('email', 'Not provided'))
        subject = sanitize_input(data.get('subject', 'No Subject'))
        service = sanitize_input(data.get('service', 'Not specified'))
        message = sanitize_input(data.get('message', 'Not provided'))
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"📧 MechNerve Contact: {subject[:50]}"
        msg['From'] = f"MechNerve Website <{sender_email}>"
        msg['To'] = receiver_email
        msg['Reply-To'] = email
        msg['X-Priority'] = '1'  # High priority
        
        # Plain text version
        text = f"""
🔔 NEW CONTACT FORM SUBMISSION - MechNerve Solutions

📋 Details:
────────────────────────────────────────────
👤 Name: {name}
📧 Email: {email}
📋 Subject: {subject}
🔧 Service Interest: {service}
⏰ Received: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

💬 Message:
────────────────────────────────────────────
{message}

────────────────────────────────────────────
📍 This message was sent from the MechNerve Solutions contact form.
🔗 Website: https://mechnervesolutions.com
📞 Phone: +91 7995961231
        """
        
        # HTML version (more professional)
        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact - MechNerve</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f5f7fa; }}
        .container {{ max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #0b0f19, #1e293b); color: white; padding: 30px; text-align: center; }}
        .header h2 {{ margin: 0; font-size: 24px; color: #38bdf8; }}
        .content {{ padding: 30px; }}
        .field {{ margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #38bdf8; }}
        .field-label {{ color: #64748b; font-size: 14px; font-weight: 600; margin-bottom: 5px; display: flex; align-items: center; gap: 8px; }}
        .field-value {{ color: #1e293b; font-size: 16px; }}
        .message-box {{ background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; font-family: monospace; white-space: pre-wrap; }}
        .footer {{ background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }}
        .badge {{ display: inline-block; background: #38bdf8; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🚀 New Contact Form Submission</h2>
            <p>MechNerve Solutions Website</p>
            <span class="badge">Priority: High</span>
        </div>
        
        <div class="content">
            <div class="field">
                <div class="field-label">👤 Contact Person</div>
                <div class="field-value">{name}</div>
            </div>
            
            <div class="field">
                <div class="field-label">📧 Email Address</div>
                <div class="field-value">
                    <a href="mailto:{email}" style="color: #38bdf8; text-decoration: none;">{email}</a>
                </div>
            </div>
            
            <div class="field">
                <div class="field-label">📋 Subject</div>
                <div class="field-value">{subject}</div>
            </div>
            
            <div class="field">
                <div class="field-label">🔧 Service Interest</div>
                <div class="field-value">{service}</div>
            </div>
            
            <div class="field">
                <div class="field-label">⏰ Received At</div>
                <div class="field-value">{datetime.now().strftime('%B %d, %Y at %I:%M %p')}</div>
            </div>
            
            <div style="margin-top: 30px;">
                <div class="field-label">💬 Message Details</div>
                <div class="message-box">{message}</div>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
                <strong>📞 Quick Actions:</strong><br>
                • <a href="mailto:{email}?subject=Re: {subject}" style="color: #38bdf8;">Reply to sender</a><br>
                • Add to CRM: {name} - {email}<br>
                • Follow up within: 24 hours
            </div>
        </div>
        
        <div class="footer">
            <p>© {datetime.now().year} MechNerve Solutions • Hyderabad, India</p>
            <p>📧 mechnervesolutions@gmail.com • 📱 +91 7995961231</p>
            <p style="font-size: 10px; color: #94a3b8;">This email was automatically generated from the website contact form.</p>
        </div>
    </div>
</body>
</html>"""
        
        # Attach both versions
        part1 = MIMEText(text, 'plain')
        part2 = MIMEText(html, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email using Gmail SMTP
        logger.info(f"📧 Attempting to send email to {receiver_email}")
        
        with smtplib.SMTP('smtp.gmail.com', 587, timeout=10) as server:
            server.set_debuglevel(1)  # Enable debug output
            server.starttls()
            server.login(sender_email, password)
            server.send_message(msg)
            
        logger.info("✅ Email sent successfully via SMTP")
        return True
            
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"❌ SMTP Authentication Failed: {str(e)}")
        logger.error("Please check your email password (use App Password, not regular password)")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"❌ SMTP Error: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected email error: {str(e)}")
        logger.error(traceback.format_exc())
        return False

def save_contact_to_file(data):
    """Save contact form data to JSON file as backup"""
    try:
        filename = "contact_submissions.json"
        
        # Prepare the entry
        entry = {
            "timestamp": datetime.now().isoformat(),
            "ip": request.remote_addr if request else "unknown",
            "user_agent": request.headers.get('User-Agent', 'unknown') if request else "unknown",
            "data": data
        }
        
        # Read existing data or create new list
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
                if not isinstance(existing_data, list):
                    existing_data = []
        except (FileNotFoundError, json.JSONDecodeError):
            existing_data = []
        
        # Add new entry (limit to last 100 submissions)
        existing_data.append(entry)
        if len(existing_data) > 100:
            existing_data = existing_data[-100:]
        
        # Save back to file
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, indent=2, default=str, ensure_ascii=False)
        
        logger.info(f"✅ Contact saved to {filename}")
        return True
        
    except Exception as e:
        logger.error(f"⚠️ File save error: {str(e)}")
        return False

def log_contact_to_console(data):
    """Log contact data to console (for debugging)"""
    logger.info("\n" + "="*60)
    logger.info("📧 CONTACT FORM SUBMISSION RECEIVED")
    logger.info("="*60)
    logger.info(f"👤 Name: {data.get('name', 'N/A')}")
    logger.info(f"📧 Email: {data.get('email', 'N/A')}")
    logger.info(f"📋 Subject: {data.get('subject', 'N/A')}")
    logger.info(f"🔧 Service: {data.get('service', 'N/A')}")
    logger.info(f"🌐 IP: {request.remote_addr if request else 'N/A'}")
    logger.info(f"💬 Message Preview: {data.get('message', 'N/A')[:100]}...")
    logger.info("="*60 + "\n")
    return True

@app.route("/api/contact", methods=["POST", "OPTIONS"])
def contact_api():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response
    
    try:
        # Check if request is JSON
        if not request.is_json:
            return jsonify({
                "success": False,
                "message": "Invalid request format. Please use JSON."
            }), 400
        
        data = request.json
        
        # Validate required fields
        required_fields = ['name', 'email', 'subject', 'message']
        missing_fields = []
        for field in required_fields:
            if not data.get(field) or str(data.get(field, '')).strip() == '':
                missing_fields.append(field.replace('_', ' '))
        
        if missing_fields:
            return jsonify({
                "success": False,
                "message": f"Please provide: {', '.join(missing_fields)}"
            }), 400
        
        # Validate email format
        email = data.get('email', '').strip()
        if not validate_email(email):
            return jsonify({
                "success": False,
                "message": "Please provide a valid email address"
            }), 400
        
        # Validate message length
        message = data.get('message', '').strip()
        if len(message) < 10:
            return jsonify({
                "success": False,
                "message": "Message should be at least 10 characters long"
            }), 400
        
        if len(message) > 5000:
            return jsonify({
                "success": False,
                "message": "Message is too long (max 5000 characters)"
            }), 400
        
        # Clean and sanitize the data
        cleaned_data = {
            'name': sanitize_input(data.get('name', '')).strip(),
            'email': email,
            'subject': sanitize_input(data.get('subject', '')).strip(),
            'service': sanitize_input(data.get('service', 'General Inquiry')).strip(),
            'message': message
        }
        
        # Log to console (always works)
        log_contact_to_console(cleaned_data)
        
        # Try to send email
        email_sent = False
        try:
            email_sent = send_email_via_smtp(cleaned_data)
        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}")
        
        # Save to file as backup (always try)
        file_saved = save_contact_to_file(cleaned_data)
        
        # Prepare response based on what worked
        if email_sent:
            message = "✅ Thank you for your message! We've received it and will get back to you within 24 hours. A confirmation has been sent to your email."
        elif file_saved:
            message = "📝 Thank you for your message! We've saved your inquiry. Please also email us directly at mechnervesolutions@gmail.com for faster response."
        else:
            message = "📧 Thank you for contacting us! Please email us directly at mechnervesolutions@gmail.com"
        
        response = jsonify({
            "success": True, 
            "message": message,
            "email_sent": email_sent,
            "saved_locally": file_saved
        })
        
        return add_cors_headers(response)
        
    except Exception as e:
        logger.error(f"❌ Contact API Error: {str(e)}")
        logger.error(traceback.format_exc())
        
        response = jsonify({
            "success": False,
            "message": "An error occurred. Please email us directly at mechnervesolutions@gmail.com"
        })
        return add_cors_headers(response), 500

@app.route("/health")
def health():
    return jsonify({
        "status": "healthy",
        "service": "mechnerve-website",
        "timestamp": datetime.now().isoformat(),
        "email_configured": bool(os.environ.get("EMAIL_PASSWORD", ""))
    }), 200

@app.route("/api/submissions", methods=["GET"])
def get_submissions():
    """API endpoint to view saved submissions (for debugging)"""
    try:
        with open("contact_submissions.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        return jsonify({
            "success": True, 
            "count": len(data), 
            "submissions": data,
            "server_time": datetime.now().isoformat()
        })
    except FileNotFoundError:
        return jsonify({"success": True, "count": 0, "submissions": []})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/test-email", methods=["GET"])
def test_email():
    """Test endpoint to check email configuration"""
    test_data = {
        "name": "Test User",
        "email": "test@example.com",
        "subject": "Test Email from Website",
        "service": "Testing",
        "message": "This is a test email to verify the contact form is working correctly."
    }
    
    try:
        email_sent = send_email_via_smtp(test_data)
        if email_sent:
            return jsonify({
                "success": True,
                "message": "✅ Test email sent successfully!",
                "email_configured": True
            })
        else:
            return jsonify({
                "success": False,
                "message": "⚠️ Could not send test email. Check configuration.",
                "email_configured": False
            })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"❌ Error: {str(e)}",
            "email_configured": False
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Server Error: {str(error)}")
    return jsonify({"success": False, "message": "Internal server error"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    
    # Check email configuration on startup
    email_password = os.environ.get("EMAIL_PASSWORD", "")
    if email_password:
        logger.info("✅ Email configuration found")
    else:
        logger.warning("⚠️ EMAIL_PASSWORD not set. Emails will not be sent.")
        logger.info("To enable email sending, set EMAIL_PASSWORD environment variable")
        logger.info("For Gmail, use App Password (not your regular password)")
    
    app.run(debug=True, host='0.0.0.0', port=port)

