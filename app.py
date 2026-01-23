from flask import Flask, render_template, request, redirect, url_for
import smtplib
import os
from email.message import EmailMessage

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

@app.route("/send-message", methods=["POST"])
def send_message():
    name = request.form["name"]
    email = request.form["email"]
    message = request.form["message"]

    msg = EmailMessage()
    msg["Subject"] = "New Contact Message | MechNerve"
    msg["From"] = os.environ.get("EMAIL_USER")
    msg["To"] = os.environ.get("EMAIL_USER")
    msg.set_content(
        f"Name: {name}\n"
        f"Email: {email}\n\n"
        f"Message:\n{message}"
    )

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(
            os.environ.get("EMAIL_USER"),
            os.environ.get("EMAIL_PASS")
        )
        server.send_message(msg)

    return redirect(url_for("contact"))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
