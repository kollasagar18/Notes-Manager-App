// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

const router = express.Router();

// ================= OTP TEMP STORE =================
// { emailOrPhone: { otp, expiresAt, userData } }
const otpStore = {};

// ✅ Generate OTP (6 digits)
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ Normalize phone → always +91XXXXXXXXXX
function normalizePhone(phone) {
  if (!phone) return null;
  return `+91${phone.replace(/\D/g, "")}`;
}

// ✅ Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Twilio Client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ================== ROUTES ==================

// ✅ Step 1: Register (Email OR Phone)
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || (!email && !phone) || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ msg: "All fields are required (email OR phone)" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    // Strong password check
    const strongRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/;
    if (!strongRegex.test(password)) {
      return res.status(400).json({
        msg: "Password must be at least 6 chars, include uppercase, number & special char",
      });
    }

    const normalizedPhone = phone ? normalizePhone(phone) : null;

    if (email) {
      const emailExists = await User.findOne({ email: email.trim().toLowerCase() });
      if (emailExists) return res.status(400).json({ msg: "Email already registered" });
    }
    if (normalizedPhone) {
      const phoneExists = await User.findOne({ phone: normalizedPhone });
      if (phoneExists) return res.status(400).json({ msg: "Phone already registered" });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 2 * 60 * 1000;

    const key = email ? email.trim().toLowerCase() : normalizedPhone;
    otpStore[key] = {
      otp,
      expiresAt,
      userData: { name, email: email?.trim().toLowerCase(), phone: normalizedPhone, password },
    };

    if (email) {
      await transporter.sendMail({
        from: `"Notes App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your account - Notes App",
        text: `Hello ${name},\n\nYour OTP is: ${otp}\n\nIt will expire in 2 minutes.`,
      });
      res.json({ msg: "OTP sent to email. Please verify.", email });
    } else {
      await twilioClient.messages.create({
        body: `Your Notes App OTP is: ${otp}`,
        from: process.env.TWILIO_PHONE,
        to: normalizedPhone,
      });
      res.json({ msg: "OTP sent to phone. Please verify.", phone: normalizedPhone });
    }
  } catch (err) {
    console.error("❌ Error in /register:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Step 2: Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, phone, otp } = req.body;
    const key = email ? email.trim().toLowerCase() : normalizePhone(phone);

    if (!otpStore[key]) return res.status(400).json({ msg: "No OTP request found" });

    const { otp: storedOtp, expiresAt, userData } = otpStore[key];

    if (Date.now() > expiresAt) {
      delete otpStore[key];
      return res.status(400).json({ msg: "OTP expired. Please request again." });
    }

    if (otp !== storedOtp) return res.status(400).json({ msg: "Invalid OTP. Try again." });

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new User({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: hashedPassword,
      isVerified: true,
    });

    await newUser.save();
    delete otpStore[key];

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      msg: "User registered & verified successfully!",
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, phone: newUser.phone },
    });
  } catch (err) {
    console.error("❌ Error in /verify-otp:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { email, phone } = req.body;
    const key = email ? email.trim().toLowerCase() : normalizePhone(phone);

    if (!otpStore[key]) return res.status(400).json({ msg: "No pending registration" });

    const otp = generateOTP();
    const expiresAt = Date.now() + 2 * 60 * 1000;
    otpStore[key].otp = otp;
    otpStore[key].expiresAt = expiresAt;

    if (email) {
      await transporter.sendMail({
        from: `"Notes App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Resend OTP - Notes App",
        text: `Your new OTP is: ${otp}\n\nIt will expire in 2 minutes.`,
      });
      res.json({ msg: "New OTP sent to email" });
    } else {
      await twilioClient.messages.create({
        body: `Your new Notes App OTP is: ${otp}`,
        from: process.env.TWILIO_PHONE,
        to: normalizePhone(phone),
      });
      res.json({ msg: "New OTP sent to phone" });
    }
  } catch (err) {
    console.error("❌ Error in /resend-otp:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const query = email
      ? { email: email.trim().toLowerCase() }
      : { phone: normalizePhone(phone) };

    const user = await User.findOne(query);
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });
    if (!user.isVerified) return res.status(400).json({ msg: "Please verify your account first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      msg: "Login success",
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error("❌ Error in /login:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================== Forgot Password Flow ==================

// ✅ Step 1: Forgot Password (send OTP)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, phone } = req.body;
    const query = email
      ? { email: email.trim().toLowerCase() }
      : { phone: normalizePhone(phone) };

    const user = await User.findOne(query);
    if (!user) return res.status(400).json({ msg: "User not found" });

    const otp = generateOTP();
    const expiresAt = Date.now() + 2 * 60 * 1000;
    const key = email ? email.trim().toLowerCase() : normalizePhone(phone);

    otpStore[key] = { otp, expiresAt, resetFor: user._id };

    if (email) {
      await transporter.sendMail({
        from: `"Notes App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset OTP",
        text: `Your password reset OTP is: ${otp}\nIt expires in 2 minutes.`,
      });
      res.json({ msg: "Reset OTP sent to email" });
    } else {
      await twilioClient.messages.create({
        body: `Your Notes App password reset OTP is: ${otp}`,
        from: process.env.TWILIO_PHONE,
        to: normalizePhone(phone),
      });
      res.json({ msg: "Reset OTP sent to phone" });
    }
  } catch (err) {
    console.error("❌ Error in /forgot-password:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Step 2: Verify Reset OTP
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, phone, otp } = req.body;
    const key = email ? email.trim().toLowerCase() : normalizePhone(phone);

    if (!otpStore[key]) return res.status(400).json({ msg: "No reset request found" });

    const { otp: storedOtp, expiresAt, resetFor } = otpStore[key];

    if (Date.now() > expiresAt) {
      delete otpStore[key];
      return res.status(400).json({ msg: "OTP expired" });
    }

    if (otp !== storedOtp) return res.status(400).json({ msg: "Invalid OTP" });

    const resetToken = jwt.sign({ id: resetFor }, process.env.JWT_SECRET, { expiresIn: "5m" });
    res.json({ msg: "OTP verified, use this reset token to reset password", resetToken });
  } catch (err) {
    console.error("❌ Error in /verify-reset-otp:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Step 3: Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken) return res.status(400).json({ msg: "Reset token required" });
    if (newPassword !== confirmPassword) return res.status(400).json({ msg: "Passwords do not match" });

    const strongRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/;
    if (!strongRegex.test(newPassword)) {
      return res.status(400).json({ msg: "Password not strong enough" });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ msg: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: "Password reset successful. You can now login with new password" });
  } catch (err) {
    console.error("❌ Error in /reset-password:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
