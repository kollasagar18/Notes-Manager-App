const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Note = require("../models/Note");
const { protect, admin } = require("../middleware/authMiddleware");
const generateToken = require("../utils/generateToken"); // ✅ JWT helper

const router = express.Router();

/**
 * @desc    Admin Login
 * @route   POST /api/admin/login
 * @access  Public
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch && user.isAdmin) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id, true), // mark admin in token
      });
    } else {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }
  } catch (err) {
    console.error("❌ Error during admin login:", err.message);
    res.status(500).json({ message: "Server error during admin login" });
  }
});

/**
 * @desc    Get all registered users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err.message);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
router.delete("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.status(200).json({ message: "✅ User deleted by admin" });
  } catch (err) {
    console.error("❌ Error deleting user:", err.message);
    res.status(500).json({ message: "Server error deleting user" });
  }
});

/**
 * @desc    Get all notes created by all users
 * @route   GET /api/admin/notes
 * @access  Private/Admin
 */
router.get("/notes", protect, admin, async (req, res) => {
  try {
    const notes = await Note.find().populate("user", "name email");
    res.status(200).json(notes);
  } catch (err) {
    console.error("❌ Error fetching notes:", err.message);
    res.status(500).json({ message: "Server error fetching notes" });
  }
});

/**
 * @desc    Delete any inappropriate note
 * @route   DELETE /api/admin/notes/:id
 * @access  Private/Admin
 */
router.delete("/notes/:id", protect, admin, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    await note.deleteOne();
    res.status(200).json({ message: "✅ Note deleted by admin" });
  } catch (err) {
    console.error("❌ Error deleting note:", err.message);
    res.status(500).json({ message: "Server error deleting note" });
  }
});

module.exports = router;
