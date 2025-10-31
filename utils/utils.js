import twilio from "twilio";
import "dotenv/config";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function notifyOrderDetails(order) {
  const numbers = ["+919866654315", "+918986981197"];

  // Use Promise.all to run all message sends concurrently
  const results = await Promise.all(
    numbers.map(async (number) => {
      try {
        const message = await client.messages.create({
          body: `🛡️ New Order Received!
          Name: ${order.name}
          Email: ${order.email}
          Phone: ${order.phone}
          Issue: ${order.issue}
          Please check and assign.`,
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: `whatsapp:${number}`,
        });

        console.log(`✅ Message sent to ${number}: ${message.status}`);
        return { number, status: message.status };
      } catch (error) {
        console.error(`❌ Failed to send to ${number}:`, error.message);
        return { number, status: "failed", error: error.message };
      }
    })
  );

  console.log("All messages processed:", results);
  return results;
}
