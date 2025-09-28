// removeAdmin.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

async function removeAdmin() {
  try {
    const deleted = await User.deleteOne({ isAdmin: true });
    if (deleted.deletedCount > 0) {
      console.log("🗑️ Admin user deleted successfully.");
    } else {
      console.log("⚠️ No admin found to delete.");
    }
    process.exit();
  } catch (err) {
    console.error("❌ Error deleting admin:", err.message);
    process.exit(1);
  }
}

removeAdmin();
