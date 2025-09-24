const express = require("express");
const { loginAdmin } = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Note = require("../models/Note");

const router = express.Router();

// Admin Login
router.post("/login", loginAdmin);

// Get all users
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching users" });
  }
});

// Get all notes
router.get("/notes", protect, admin, async (req, res) => {
  try {
    const notes = await Note.find().populate("user", "name email");
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching notes" });
  }
});

// Delete a note
router.delete("/notes/:id", protect, admin, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    await note.deleteOne();
    res.status(200).json({ message: "✅ Note deleted by admin" });
  } catch (err) {
    res.status(500).json({ message: "Server error deleting note" });
  }
});

module.exports = router;
