
//node seeder.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTest() {
  try {
    let info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "kollasatish03@gmail.com",
      subject: "Test Email",
      text: "Hello! This is a test email.",
    });
    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

sendTest();
