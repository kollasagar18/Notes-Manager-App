require("dotenv").config();
const twilio = require("twilio");

const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function testSMS() {
  try {
    let message = await client.messages.create({
      body: "Hello from Notes App 🚀",
      from: process.env.TWILIO_PHONE,
      to: "+919398780797", // 👉 replace with your phone number
    });

    console.log("✅ SMS sent:", message.sid);
  } catch (err) {
    console.error("❌ SMS error:", err.message);
  }
}

testSMS();
