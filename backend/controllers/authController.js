import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ================== Generate OTP ==================
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ======================== REGISTER ========================
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || (!email && !phone) || !password || !confirmPassword) {
      return res.status(400).json({ msg: "All fields required (email OR phone)" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    // ✅ Strong password check
    const strongRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/;
    if (!strongRegex.test(password)) {
      return res.status(400).json({
        msg: "Password must be at least 6 chars, include uppercase, number & special char",
      });
    }

    // ✅ Check duplicates
    if (email) {
      const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
      if (emailExists) return res.status(400).json({ msg: "Email already registered" });
    }

    if (phone) {
      const normalizedPhone = `+91${phone.replace(/\D/g, "")}`;
      const phoneExists = await User.findOne({ phone: normalizedPhone });
      if (phoneExists) return res.status(400).json({ msg: "Phone already registered" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Generate OTP
    const otp = generateOTP();

    const newUser = await User.create({
      name,
      email: email ? email.toLowerCase().trim() : null,
      phone: phone ? `+91${phone.replace(/\D/g, "")}` : null,
      password: hashedPassword,
      otp,
      otpExpires: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
      isVerified: false,
    });

    // ✅ Send OTP (Email or SMS)
    if (email) {
      await sendEmail(email, "Your OTP Code", `Your OTP is ${otp}`);
    } else if (phone) {
      await twilioClient.messages.create({
        body: `Your Notes App OTP is: ${otp}`,
        from: process.env.TWILIO_PHONE,
        to: `+91${phone.replace(/\D/g, "")}`,
      });
    }

    res.status(201).json({ msg: "OTP sent. Verify to complete registration.", userId: newUser._id });
  } catch (err) {
    console.error("❌ Register Error:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ======================== VERIFY OTP ========================
export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.isVerified) return res.status(400).json({ msg: "Already verified" });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // ✅ Auto-login after verification
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      msg: "User verified & registered successfully",
      token,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error("❌ Verify OTP Error:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ======================== LOGIN ========================
export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const query = email
      ? { email: email.toLowerCase().trim() }
      : { phone: `+91${phone.replace(/\D/g, "")}` };

    const user = await User.findOne(query);
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(400).json({ msg: "Please verify your account first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      msg: "Login success",
      token,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
