from flask import Flask, render_template, request, jsonify, make_response
from werkzeug.utils import secure_filename
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import json
import logging
import traceback
from dotenv import load_dotenv

load_dotenv()

# ==================================================
# APP CONFIG
# ==================================================
app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf", "doc", "docx"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================================================
# SECURITY HEADERS
# ==================================================
@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# ==================================================
# HELPERS
# ==================================================
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def sanitize_input(text):
    if not text:
        return ""
    text = str(text)
    text = text.replace("<", "&lt;").replace(">", "&gt;")
    return text[:5000]

def validate_email(email):
    import re
    pattern = r"^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None

# ==================================================
# EMAIL SENDER
# ==================================================
def send_email(subject, body, reply_to=None, attachment_path=None, attachment_name=None):
    try:
        sender = os.environ.get("SENDER_EMAIL")
        receiver = os.environ.get("RECEIVER_EMAIL")
        password = os.environ.get("EMAIL_PASSWORD")

        if not all([sender, receiver, password]):
            logger.error("Email environment variables not configured")
            return False

        msg = MIMEMultipart()
        msg["Subject"] = subject
        msg["From"] = f"MechNerve Website <{sender}>"
        msg["To"] = receiver
        if reply_to:
            msg["Reply-To"] = reply_to

        msg.attach(MIMEText(body, "plain"))

        if attachment_path and os.path.exists(attachment_path):
            with open(attachment_path, "rb") as f:
                part = MIMEText(f.read(), "base64")
                part.add_header(
                    "Content-Disposition",
                    f'attachment; filename="{attachment_name}"'
                )
                msg.attach(part)

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender, password)
            server.send_message(msg)

        return True

    except Exception as e:
        logger.error(f"Email error: {e}")
        logger.error(traceback.format_exc())
        return False

# ==================================================
# PAGES
# ==================================================
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

# ==================================================
# CONTACT API
# ==================================================
@app.route("/api/contact", methods=["POST", "OPTIONS"])
def contact_api():
    if request.method == "OPTIONS":
        return make_response("", 200)

    try:
        if not request.is_json:
            return jsonify({"success": False, "message": "Invalid JSON"}), 400

        data = request.json

        name = sanitize_input(data.get("name"))
        email = sanitize_input(data.get("email"))
        subject = sanitize_input(data.get("subject"))
        service = sanitize_input(data.get("service", "General"))
        message = sanitize_input(data.get("message"))

        if not all([name, email, subject, message]):
            return jsonify({"success": False, "message": "All fields required"}), 400

        if not validate_email(email):
            return jsonify({"success": False, "message": "Invalid email"}), 400

        body = f"""
New Contact Submission

Name: {name}
Email: {email}
Service: {service}

Message:
{message}
"""

        sent = send_email(
            subject=f"📩 Contact Form – {subject}",
            body=body,
            reply_to=email
        )

        return jsonify({
            "success": True,
            "message": "✅ Message received. We’ll get back to you shortly.",
            "email_sent": sent
        })

    except Exception as e:
        logger.error(traceback.format_exc())
        return jsonify({"success": False, "message": "Server error"}), 500

# ==================================================
# CAREER API (WITH RESUME)
# ==================================================
@app.route("/api/career", methods=["POST"])
def career_api():
    try:
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip()
        phone = request.form.get("phone", "").strip()
        role = request.form.get("role", "").strip()
        message = request.form.get("message", "").strip()
        resume = request.files.get("resume")

        if not all([name, email, phone, role, message, resume]):
            return jsonify({"success": False, "message": "All fields required"}), 400

        if not allowed_file(resume.filename):
            return jsonify({"success": False, "message": "Invalid resume file"}), 400

        filename = secure_filename(resume.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        resume.save(filepath)

        body = f"""
New Career Application

Name: {name}
Email: {email}
Phone: {phone}
Role: {role}

Message:
{message}
"""

        send_email(
            subject=f"📄 Career Application – {role}",
            body=body,
            reply_to=email,
            attachment_path=filepath,
            attachment_name=filename
        )

        os.remove(filepath)

        return jsonify({
            "success": True,
            "message": "✅ Application submitted successfully"
        })

    except Exception as e:
        logger.error(traceback.format_exc())
        return jsonify({"success": False, "message": "Server error"}), 500

# ==================================================
# COLLABORATION API (NO RESUME)
# ==================================================
@app.route("/api/collaboration", methods=["POST"])
def collaboration_api():
    try:
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip()
        phone = request.form.get("phone", "").strip()
        message = request.form.get("message", "").strip()

        if not all([name, email, phone]):
            return jsonify({"success": False, "message": "All fields required"}), 400

        body = f"""
New Collaboration Request

Name: {name}
Email: {email}
Phone: {phone}

Message:
{message}
"""

        send_email(
            subject="🤝 Collaboration Request",
            body=body,
            reply_to=email
        )

        return jsonify({
            "success": True,
            "message": "✅ Collaboration request sent"
        })

    except Exception as e:
        logger.error(traceback.format_exc())
        return jsonify({"success": False, "message": "Server error"}), 500

# ==================================================
# HEALTH CHECK
# ==================================================
@app.route("/health")
def health():
    return jsonify({
        "status": "healthy",
        "time": datetime.now().isoformat()
    })

# ==================================================
# RUN
# ==================================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
