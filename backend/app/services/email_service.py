import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body_html: str, body_text: str = None) -> bool:
    """
    Sends an email using SMTP.
    Returns True if successful, False otherwise.
    """
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("FROM_EMAIL", smtp_user)

    if not smtp_user or not smtp_password:
        logger.warning("SMTP configuration missing. Email sending skipped.")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = to_email

        # Attach text and HTML parts
        if body_text:
            part1 = MIMEText(body_text, "plain")
            msg.attach(part1)
        
        part2 = MIMEText(body_html, "html")
        msg.attach(part2)

        # Connect to SMTP server
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email, to_email, msg.as_string())
        
        logger.info(f"Email sent successfully to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False
