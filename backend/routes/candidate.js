const express = require("express");
const Candidate = require("../models/Candidate");
const { authMiddleware } = require("../middleware/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// `resume-parser` is flaky. We'll try it defensively.
let ResumeParser = null;
try {
  // If the package is installed, require it
  ResumeParser = require("resume-parser");
} catch (_) {
  // keep null if not installed
}

const router = express.Router();

// ==================
// Multer setup
// ==================


// ==================
// Helper: clean extracted text
// ==================

// =====================
// GET candidate profile completeness
// =====================
router.get("/check-profile", authMiddleware(["candidate"]), async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user.userId });
    if (!candidate) {
      return res.json({
        complete: false,
        missing: ["firstName", "lastName", "phoneNumber", "skills"],
      });
    }

    const missing = [];
    if (!candidate.firstName || !candidate.lastName) missing.push("name");
    if (!candidate.phoneNumber) missing.push("phone");
    if (!candidate.skills || candidate.skills.length === 0) missing.push("skills");

    res.json({
      complete: missing.length === 0,
      missing,
    });
  } catch (err) {
    console.error("Error checking profile completeness", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
// GET candidate profile
// =====================
router.get("/profile", authMiddleware(["candidate"]), async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user.userId }).select("-__v");
    if (!candidate) {
      return res.status(404).json({ message: "Candidate profile not found" });
    }
    res.json(candidate);
  } catch (err) {
    console.error("Error fetching candidate profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
// UPDATE candidate profile
// =====================
router.put("/profile", authMiddleware(["candidate"]), async (req, res) => {
  try {
    // Whitelist fields allowed for update (email is read-only from resume flow)
    const allowedFields = [
      "firstName",
      "middleName",
      "lastName",
      "phoneNumber",
      "dateOfBirth",
      "gender",
      "skills",
      "education",
      "address",
      "pastEmployers",
      "certifications",
      "projects",
      "resumeUrl",
      "portfolioUrl",
      "willingToRelocate",
      "noticePeriodDays",
      "expectedCTC",
      "currentCTC",
      "preferredLocations",
      "jobTypePreference",
      "remotePreference",
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const updatedCandidate = await Candidate.findOneAndUpdate(
      { user: req.user.userId },
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updatedCandidate) {
      return res.status(404).json({ message: "Candidate profile not found" });
    }

    res.json({ message: "Profile updated successfully", candidate: updatedCandidate });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
// GET candidate skills
// =====================
router.get("/skills", authMiddleware(["candidate"]), async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user.userId }, "skills");
    if (!candidate) {
      return res.status(404).json({ message: "Candidate profile not found" });
    }
    res.json({ skills: candidate.skills || [] });
  } catch (err) {
    console.error("Error fetching candidate skills:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
