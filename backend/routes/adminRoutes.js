
const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Note = require("../models/Note");

const protect = require("../middleware/auth");
const admin = require("../middleware/admin");

// ADMIN DASHBOARD STATISTICS
router.get("/stats", protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      role: "user"
    });

    const totalNotes = await Note.countDocuments();

    const recentNotes = await Note.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("owner", "name email");

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalNotes
      },
      recentNotes
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch admin dashboard statistics."
    });
  }
});

// GET ALL REGISTERED USERS (ADMIN ONLY)
router.get("/users", protect, admin, async (req, res) => {
  try {
    const search = req.query.search || "";

    const filter = {
      role: "user"
    };

    if (search.trim()) {
      const safeSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } }
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: users.length,
      users
    });
  } catch (error) {
    console.error("Admin Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch users."
    });
  }
});

module.exports = router;
