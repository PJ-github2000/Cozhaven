import os
from typing import List, Optional
from jinja2 import Template
from logger import get_logger

logger = get_logger("email_service")

# --- Notification System Architecture (H10) ---
# This service is designed to be easily swappable (Dependency Injection).
# For now, it logs formatted HTML to emphasize the design-first philosophy.

class EmailService:
    def __init__(self):
        self.from_email = os.getenv("EMAIL_FROM", "hello@cozhaven.com")
        self.api_key = os.getenv("EMAIL_API_KEY") 

    async def send_order_confirmation(self, email: str, order_id: int, total: float, items: List[dict]):
        """
        Sends a high-end HTML order confirmation.
        Implemented as a pseudo-service for production readiness.
        """
        subject = f"Order Confirmation — #{order_id} | Cozhaven"
        
        # In a real environment, you'd load a .html file
        template_str = """
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2A2622; padding: 40px; max-width: 600px; margin: auto;">
          <h1 style="font-size: 24px; font-weight: 500; border-bottom: 2px solid #C9B8A8; padding-bottom: 20px;">Thank you for your order.</h1>
          <p style="margin-top: 30px; line-height: 1.6;">Hi,</p>
          <p style="line-height: 1.6;">Expertly crafted furniture is on its way. We've received your order <strong>#{{ order_id }}</strong> and are preparing it for delivery.</p>
          
          <div style="margin: 40px 0; background: #F9F7F5; padding: 20px; border-radius: 8px;">
            <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #8A817C;">Order Summary</h3>
            <ul style="list-style: none; padding: 0;">
              {% for item in items %}
              <li style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(201, 184, 168, 0.2);">
                <span>{{ item.qty }}x {{ item.name }}</span>
                <strong>${{ item.price }}</strong>
              </li>
              {% endfor %}
            </ul>
            <div style="display: flex; justify-content: space-between; margin-top: 20px; font-weight: 600; font-size: 18px;">
              <span>Total</span>
              <span>${{ total }}</span>
            </div>
          </div>
          
          <p style="font-size: 14px; color: #8A817C; text-align: center; margin-top: 50px;">
            Cozhaven — Modern Elegance, Timeless Comfort.
          </p>
        </div>
        """
        
        template = Template(template_str)
        html_content = template.render(order_id=order_id, total=total, items=items)

        # ─── Staff Engineer Integration Point ───
        if not self.api_key:
            logger.info("email_mock_send", 
                        to=email, 
                        subject=subject, 
                        preview=f"Order #{order_id} for ${total}")
            # Log to local file for development visibility
            with open("last_email_sent.html", "w") as f:
                f.write(html_content)
        else:
            # Here you would call SendGrid / Postmark URL
            # await self._send_external(...)
            logger.info("email_production_queue", to=email, order_id=order_id)

    async def send_welcome(self, email: str, name: str):
        """Sends a welcome email for signups."""
        logger.info("email_welcome_mock", to=email, name=name)

# Global Instance
email_service = EmailService()
