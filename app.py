from flask import Flask, render_template, request
import smtplib
from email.message import EmailMessage

app = Flask(__name__)

# ---------- EMAIL CONFIG ----------
EMAIL_ADDRESS = "mechnervesolutions@gmail.com"
EMAIL_PASSWORD = "ctbihshvre wrenbp".replace(" ", "")

# ---------- ROUTES ----------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/contact", methods=["GET", "POST"])
def contact():
    success = False
    error = False

    if request.method == "POST":
        name = request.form.get("name")
        email = request.form.get("email")
        message = request.form.get("message")

        try:
            msg = EmailMessage()
            msg["Subject"] = "New Contact Form Submission - MechNerve"
            msg["From"] = EMAIL_ADDRESS
            msg["To"] = EMAIL_ADDRESS

            msg.set_content(f"""
New message from MechNerve website

Name: {name}
Email: {email}

Message:
{message}
            """)

            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                server.send_message(msg)

            success = True

        except Exception as e:
            print("Email error:", e)
            error = True

    return render_template("contact.html", success=success, error=error)

if __name__ == "__main__":
    app.run(debug=True)
