const express = require("express"); 
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// ===== Middleware =====
app.use(express.json()); // Parse incoming JSON
app.use(cors()); // Enable CORS for frontend

// ===== Routes =====
app.use("/api/auth", require("./routes/authRoutes"));  // Normal user auth
app.use("/api/notes", require("./routes/noteRoutes")); // Notes
app.use("/api/admin", require("./routes/adminRoutes")); // ✅ Admin routes

// ===== Health check / Root route =====
app.get("/", (req, res) => {
  res.json({ message: "🚀 Notes API is running successfully..." });
});

// ===== Error Handling =====
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ msg: "Internal server error" });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
