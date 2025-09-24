// seeder.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

async function seedAdmin() {
  try {
    const adminEmail = "kollasagar@gmail.com";
    const adminPassword = "kollasagar@123";       
    const adminName = "Kollasagar";   

    const adminExists = await User.findOne({ isAdmin: true });

    if (adminExists) {
      console.log(`✅ Admin already exists: ${adminExists.email}`);
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = new User({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      isVerified: true,
      isAdmin: true,
    });

    await admin.save();
    console.log(`✅ New Admin Created: ${admin.email}`);
    process.exit();
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
    process.exit(1);
  }
}

seedAdmin();
