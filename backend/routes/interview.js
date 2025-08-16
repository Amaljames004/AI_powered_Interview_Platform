// routes/interviews.js
const express = require("express");
const router = express.Router();
const AIInterviewLog = require("../models/AIInterviewLog");
const { authMiddleware } = require("../middleware/auth");

// ✅ GET upcoming AI interviews for the logged-in candidate
router.get("/upcoming", authMiddleware(["candidate"]), async (req, res) => {
  try {
    // Check if AIInterviewLog collection exists
    const collections = await AIInterviewLog.db.db
      .listCollections({ name: AIInterviewLog.collection.name })
      .toArray();
    if (collections.length === 0) return res.json([]);

    const now = new Date();
    const interviews = await AIInterviewLog.find({
      candidate: req.user._id,
      scheduledAt: { $gte: now }
    })
      .populate("jobGroup", "title company")
      .sort({ scheduledAt: 1 })
      .lean();

    res.json(interviews || []);
  } catch (err) {
    console.error("❌ Error fetching upcoming interviews:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
