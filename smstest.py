import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(sender_email, sender_password, receiver_email, subject, body):
    """
    Sends an email.

    Args:
        sender_email: The sender's email address.
        sender_password: The sender's email password or app password.  For Gmail, it's best practice to use an App Password.
        receiver_email: The recipient's email address.
        subject: The email subject.
        body: The email body (can be plain text or HTML).
    """

    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, message.as_string())
        print("Email sent successfully!")
    except Exception as e:
        print(f"Error sending email: {e}")



if __name__ == "__main__":
    sender_email = "mylifeasabdo@gmail.com"  # Replace with your email
    sender_password = "ymhn xdwu cdbb yveo"  # Replace with your password or, ideally, an App Password (Gmail).  NEVER put your real password in code that you share.
    receiver_email = "7kkv3@e-record.com"  # Replace with the recipient's email
    subject = "Test Email"
    body = "This is a test email sent from Python."  # Or use HTML body:  "<html><body><h1>Hello</h1><p>This is a test.</p></body></html>"

    send_email(sender_email, sender_password, receiver_email, subject, body)


