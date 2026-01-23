from flask import Flask, render_template, request, jsonify, flash
from flask_mail import Mail, Message
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration for Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Using Gmail SMTP
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME', 'mechnervesolutions@gmail.com')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', '')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', 'mechnervesolutions@gmail.com')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')

# Initialize Flask-Mail
mail = Mail(app)

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
        
        # Validate required fields
        required_fields = ['name', 'email', 'subject', 'message']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    "success": False,
                    "message": f"Please provide {field.replace('_', ' ')}"
                }), 400
        
        # Extract data
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        subject = data.get('subject', '').strip()
        service = data.get('service', 'Not specified')
        message = data.get('message', '').strip()
        
        # Create email message
        msg = Message(
            subject=f"New Contact Form: {subject}",
            recipients=['mechnervesolutions@gmail.com'],  # Your email address
            reply_to=email
        )
        
        # Email body
        msg.body = f"""
New Contact Form Submission from MechNerve Website:

Name: {name}
Email: {email}
Subject: {subject}
Service Interest: {service}

Message:
{message}

---
This message was sent from the MechNerve Solutions contact form.
        """
        
        # HTML version of email
        msg.html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #38bdf8, #0ea5e9); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .field {{ margin-bottom: 15px; }}
        .label {{ font-weight: bold; color: #38bdf8; }}
        .value {{ margin-top: 5px; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #38bdf8; }}
        .footer {{ margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; font-size: 12px; color: #666; text-align: center; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Contact Form Submission</h2>
            <p>MechNerve Solutions Website</p>
        </div>
        
        <div class="content">
            <div class="field">
                <div class="label">👤 Name</div>
                <div class="value">{name}</div>
            </div>
            
            <div class="field">
                <div class="label">📧 Email</div>
                <div class="value">{email}</div>
            </div>
            
            <div class="field">
                <div class="label">📋 Subject</div>
                <div class="value">{subject}</div>
            </div>
            
            <div class="field">
                <div class="label">🔧 Service Interest</div>
                <div class="value">{service}</div>
            </div>
            
            <div class="field">
                <div class="label">💬 Message</div>
                <div class="value">{message}</div>
            </div>
        </div>
        
        <div class="footer">
            <p>This message was sent from the MechNerve Solutions contact form at {request.host_url}</p>
            <p>© 2026 MechNerve Solutions. Hyderabad, India.</p>
        </div>
    </div>
</body>
</html>
        """
        
        # Send email
        mail.send(msg)
        
        # Also send confirmation email to user
        send_confirmation_email(name, email, subject)
        
        print(f"✅ Email sent successfully from {name} ({email})")
        
        return jsonify({
            "success": True, 
            "message": "Thank you for your message! We've sent a confirmation email and will get back to you within 24 hours."
        })
        
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"An error occurred: {str(e)}. Please try again or email us directly at mechnervesolutions@gmail.com"
        }), 500

def send_confirmation_email(name, email, subject):
    """Send confirmation email to the user"""
    try:
        msg = Message(
            subject=f"Thank you for contacting MechNerve Solutions",
            recipients=[email],
            sender=('MechNerve Solutions', 'mechnervesolutions@gmail.com')
        )
        
        msg.body = f"""
Dear {name},

Thank you for contacting MechNerve Solutions!

We have received your message regarding "{subject}" and our team will review it shortly.

Here's what happens next:
1. Our team will review your inquiry within 24 hours
2. We'll contact you to discuss your project requirements
3. Schedule a consultation call if needed
4. Provide you with a detailed proposal

If you have any urgent questions, feel free to call us at +91 7995961231.

Best regards,
The MechNerve Solutions Team
Hyderabad, India
Email: mechnervesolutions@gmail.com
Phone: +91 7995961231

---
This is an automated message. Please do not reply to this email.
        """
        
        msg.html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #38bdf8, #0ea5e9); color: white; padding: 30px; text-align: center; }}
        .content {{ padding: 30px; }}
        .greeting {{ font-size: 18px; margin-bottom: 20px; color: #0b0f19; }}
        .message {{ margin-bottom: 25px; color: #1e293b; }}
        .steps {{ background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0; }}
        .step {{ margin-bottom: 15px; padding-left: 20px; position: relative; }}
        .step:before {{ content: '✓'; position: absolute; left: 0; color: #10b981; font-weight: bold; }}
        .contact-info {{ background: linear-gradient(135deg, #f1f5f9, #e2e8f0); padding: 20px; border-radius: 8px; margin: 25px 0; }}
        .contact-item {{ display: flex; align-items: center; margin-bottom: 10px; }}
        .contact-icon {{ margin-right: 10px; color: #38bdf8; }}
        .footer {{ background: #0b0f19; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px; }}
        .signature {{ color: #0ea5e9; font-weight: bold; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Thank You for Contacting MechNerve Solutions!</h2>
        </div>
        
        <div class="content">
            <div class="greeting">
                Dear <strong>{name}</strong>,
            </div>
            
            <div class="message">
                Thank you for your interest in MechNerve Solutions! We have received your message regarding 
                "<strong>{subject}</strong>" and our team is already reviewing it.
            </div>
            
            <div class="steps">
                <h3 style="color: #0ea5e9; margin-top: 0;">What Happens Next:</h3>
                <div class="step">Our team will review your inquiry within 24 hours</div>
                <div class="step">We'll contact you to discuss your project requirements</div>
                <div class="step">Schedule a consultation call if needed</div>
                <div class="step">Provide you with a detailed proposal</div>
            </div>
            
            <div class="contact-info">
                <h3 style="color: #0ea5e9; margin-top: 0;">Need Immediate Assistance?</h3>
                <div class="contact-item">
                    <span class="contact-icon">📧</span>
                    <span>Email: mechnervesolutions@gmail.com</span>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">📱</span>
                    <span>Phone: +91 7995961231</span>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">📍</span>
                    <span>Location: Hyderabad, India</span>
                </div>
            </div>
            
            <div class="signature">
                Best regards,<br>
                The MechNerve Solutions Team
            </div>
        </div>
        
        <div class="footer">
            <p>This is an automated confirmation email. Please do not reply to this email.</p>
            <p>© 2026 MechNerve Solutions. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """
        
        mail.send(msg)
        print(f"✅ Confirmation email sent to {email}")
        
    except Exception as e:
        print(f"⚠️ Could not send confirmation email: {str(e)}")

@app.route("/health")
def health():
    return "OK", 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
