// routes/noteRoutes.js
const express = require("express");
const Note = require("../models/Note");
const { protect } = require("../middleware/authMiddleware");


const router = express.Router();

/**
 * @desc    Create new note
 * @route   POST /api/notes
 * @access  Private
 */
router.post("/", protect, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const note = await Note.create({
      user: req.user._id,
      title,
      description,
    });

    console.log("✅ Note created:", note);
    res.status(201).json(note);
  } catch (err) {
    console.error("❌ Create Note Error:", err.message);
    res.status(500).json({ message: "Server error while creating note" });
  }
});

/**
 * @desc    Get all notes of logged-in user
 * @route   GET /api/notes
 * @access  Private
 */
router.get("/", protect, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
    console.log("✅ Notes fetched for user:", req.user._id);

    res.json(notes);
  } catch (err) {
    console.error("❌ Get Notes Error:", err.message);
    res.status(500).json({ message: "Server error while fetching notes" });
  }
});

/**
 * @desc    Update a note
 * @route   PUT /api/notes/:id
 * @access  Private
 */
router.put("/:id", protect, async (req, res) => {
  try {
    const { title, description } = req.body;

    let note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Ensure the logged-in user owns the note
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    note.title = title || note.title;
    note.description = description || note.description;

    const updatedNote = await note.save();
    console.log("✅ Note updated:", updatedNote);

    res.json(updatedNote);
  } catch (err) {
    console.error("❌ Update Note Error:", err.message);
    res.status(500).json({ message: "Server error while updating note" });
  }
});

/**
 * @desc    Delete a note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Ensure the logged-in user owns the note
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await note.deleteOne();
    console.log("✅ Note deleted:", req.params.id);

    res.json({ message: "Note removed successfully" });
  } catch (err) {
    console.error("❌ Delete Note Error:", err.message);
    res.status(500).json({ message: "Server error while deleting note" });
  }
});

module.exports = router;
