from flask import Flask, render_template, request, jsonify, make_response
from werkzeug.utils import secure_filename
import os, smtplib, logging, traceback
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime
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
# HELPERS
# ==================================================
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_email(email):
    import re
    return re.match(r"^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$", email)

# ==================================================
# EMAIL
# ==================================================
def send_email(subject, body, reply_to=None, attachment_path=None):
    try:
        sender = os.getenv("SENDER_EMAIL")
        receiver = os.getenv("RECEIVER_EMAIL")
        password = os.getenv("EMAIL_PASSWORD")

        if not all([sender, receiver, password]):
            logger.error("Email env vars missing")
            return False

        msg = MIMEMultipart()
        msg["From"] = f"MechNerve Website <{sender}>"
        msg["To"] = receiver
        msg["Subject"] = subject
        if reply_to:
            msg["Reply-To"] = reply_to

        msg.attach(MIMEText(body, "plain"))

        if attachment_path:
            part = MIMEBase("application", "octet-stream")
            with open(attachment_path, "rb") as f:
                part.set_payload(f.read())
            encoders.encode_base64(part)
            part.add_header(
                "Content-Disposition",
                f'attachment; filename="{os.path.basename(attachment_path)}"'
            )
            msg.attach(part)

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender, password)
            server.send_message(msg)

        return True

    except Exception:
        logger.error(traceback.format_exc())
        return False

# ==================================================
# PAGES
# ==================================================
@app.route("/")
def home(): return render_template("index.html")

@app.route("/about")
def about(): return render_template("about.html")

@app.route("/contact")
def contact(): return render_template("contact.html")

# ==================================================
# CONTACT API
# ==================================================
@app.route("/api/contact", methods=["POST"])
def contact_api():
    try:
        data = request.get_json()
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        service = data.get("service", "General")
        message = data.get("message", "").strip()

        if not all([name, email, message]):
            return jsonify(success=False, message="All fields required"), 400

        body = f"""
CONTACT FORM

Name: {name}
Email: {email}
Service: {service}

Message:
{message}
"""

        send_email(
            subject="📩 New Contact Form",
            body=body,
            reply_to=email
        )

        return jsonify(success=True, message="✅ Message sent successfully")

    except Exception:
        logger.error(traceback.format_exc())
        return jsonify(success=False, message="Server error"), 500

# ==================================================
# CAREER API
# ==================================================
@app.route("/api/career", methods=["POST"])
def career_api():
    try:
        name = request.form.get("name")
        email = request.form.get("email")
        phone = request.form.get("phone")
        role = request.form.get("role")
        message = request.form.get("message")
        resume = request.files.get("resume")

        if not all([name, email, phone, role, message, resume]):
            return jsonify(success=False, message="All fields required"), 400

        if not allowed_file(resume.filename):
            return jsonify(success=False, message="Invalid resume file"), 400

        filename = secure_filename(resume.filename)
        path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        resume.save(path)

        body = f"""
CAREER APPLICATION

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
            attachment_path=path
        )

        os.remove(path)

        return jsonify(success=True, message="✅ Application submitted")

    except Exception:
        logger.error(traceback.format_exc())
        return jsonify(success=False, message="Server error"), 500

# ==================================================
# COLLABORATION API
# ==================================================
@app.route("/api/collaboration", methods=["POST"])
def collaboration_api():
    try:
        name = request.form.get("name")
        email = request.form.get("email")
        phone = request.form.get("phone")
        message = request.form.get("message", "")

        if not all([name, email, phone]):
            return jsonify(success=False, message="All fields required"), 400

        body = f"""
COLLABORATION REQUEST

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

        return jsonify(success=True, message="✅ Collaboration request sent")

    except Exception:
        logger.error(traceback.format_exc())
        return jsonify(success=False, message="Server error"), 500

# ==================================================
# RUN
# ==================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
