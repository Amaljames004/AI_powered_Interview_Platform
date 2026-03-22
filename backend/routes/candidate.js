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
// Multer setup for resumes
// ==================
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const resumeFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, and DOCX files are allowed"), false);
  }
};

const upload = multer({ 
  storage: resumeStorage, 
  fileFilter: resumeFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});


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

// =====================
// POST upload resume
// =====================
router.post("/upload/resume", authMiddleware(["candidate"]), upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume file provided" });
    }

    const candidate = await Candidate.findOneAndUpdate(
      { user: req.user.userId },
      {
        resume: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: req.file.path,
          size: req.file.size,
          uploadedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate profile not found" });
    }

    res.json({
      message: "Resume uploaded successfully",
      resume: candidate.resume
    });
  } catch (err) {
    console.error("Error uploading resume:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
