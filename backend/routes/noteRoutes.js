
const express = require("express");
const mongoose = require("mongoose");

const Note = require("../models/Note");
const protect = require("../middleware/auth");

const router = express.Router();

// Validate tags
const validateTags = (tags) => {
  return (
    tags === undefined ||
    (
      Array.isArray(tags) &&
      tags.every(
        (tag) => typeof tag === "string" && tag.trim().length > 0
      )
    )
  );
};

// CREATE NOTE
router.post("/", protect, async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (
      typeof title !== "string" ||
      title.trim().length < 3 ||
      title.trim().length > 120
    ) {
      return res.status(400).json({
        success: false,
        message: "Title must be between 3 and 120 characters."
      });
    }

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Content is required."
      });
    }

    if (!validateTags(tags)) {
      return res.status(400).json({
        success: false,
        message: "Tags must be an array of non-empty strings."
      });
    }

    const note = await Note.create({
      title: title.trim(),
      content: content.trim(),
      tags: (tags || []).map((tag) => tag.trim()),
      owner: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "Note created successfully.",
      data: note
    });

  } catch (error) {
    console.error("Create Note Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create note."
    });
  }
});

// GET NOTES - USER OWN NOTES / ADMIN ALL NOTES
router.get("/", protect, async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      tag = ""
    } = req.query;

    const currentPage = Number(page);
    const pageLimit = Number(limit);

    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1 ||
      !Number.isInteger(pageLimit) ||
      pageLimit < 1 ||
      pageLimit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination values."
      });
    }

    const filter = {};

    // Normal users can only see their own notes
    if (req.user.role !== "admin") {
      filter.owner = req.user._id;
    }

    // Search in title or content
    if (search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { content: { $regex: escapedSearch, $options: "i" } }
      ];
    }

    // Filter by tag
    if (tag.trim()) {
      const escapedTag = tag.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.tags = {
        $elemMatch: {
          $regex: `^${escapedTag}$`,
          $options: "i"
        }
      };
    }

    const total = await Note.countDocuments(filter);

    const notes = await Note.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit);

    return res.status(200).json({
      success: true,
      data: notes,
      page: currentPage,
      total,
      pages: Math.ceil(total / pageLimit)
    });

  } catch (error) {
    console.error("Get Notes Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notes."
    });
  }
});

// UPDATE NOTE - OWNER ONLY
router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID."
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found."
      });
    }

    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own notes."
      });
    }

    if (
      title !== undefined &&
      (
        typeof title !== "string" ||
        title.trim().length < 3 ||
        title.trim().length > 120
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Title must be between 3 and 120 characters."
      });
    }

    if (
      content !== undefined &&
      (typeof content !== "string" || !content.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Content cannot be empty."
      });
    }

    if (!validateTags(tags)) {
      return res.status(400).json({
        success: false,
        message: "Tags must be an array of non-empty strings."
      });
    }

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();
    if (tags !== undefined) {
      note.tags = tags.map((tag) => tag.trim());
    }

    await note.save();

    return res.status(200).json({
      success: true,
      message: "Note updated successfully.",
      data: note
    });

  } catch (error) {
    console.error("Update Note Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update note."
    });
  }
});

// DELETE NOTE - OWNER OR ADMIN
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID."
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found."
      });
    }

    const isOwner =
      note.owner.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete another user's note."
      });
    }

    await Note.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully."
    });

  } catch (error) {
    console.error("Delete Note Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete note."
    });
  }
});

module.exports = router;
