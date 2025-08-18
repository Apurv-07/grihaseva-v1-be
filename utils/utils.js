import twilio from 'twilio';
import "dotenv/config";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function notifyOrderDetails(order) {
  const verification = await client.messages.create({
    body: `🛡️ Order recieved for the following details: 
        ${"\n"}Name: ${order.name},
        ${"\n"}Email: ${order.email},
        ${"\n"}Phone: ${order.phone},
        ${"\n"}Issue: ${order.issue}
        ${"\n"}Please check and assign
      `,
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: `whatsapp:+919866654315`,
  });
  console.log("Is it working", verification.status)
  return verification.status;
}
