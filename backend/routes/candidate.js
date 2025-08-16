const express = require("express");
const Candidate = require("../models/Candidate");
const { authMiddleware } = require("../middleware/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const router = express.Router();

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// Helper: clean extracted text
function cleanText(text) {
  if (!text) return "";
  return text
    .replace(/\u200b/g, " ")       // remove zero-width spaces
    .replace(/\u2011/g, "-")       // non-breaking hyphens
    .replace(/\s+/g, " ")          // normalize spaces
    .replace(/\n\s*\n/g, "\n")     // remove multiple empty lines
    .trim();
}

// =====================
// GET candidate profile
// =====================
router.get("/profile", authMiddleware(["candidate"]), async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user.userId });
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
    const updatedCandidate = await Candidate.findOneAndUpdate(
      { user: req.user.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

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
// UPLOAD resume and extract text
// =====================
router.post(
  "/upload/resume",
  authMiddleware(["candidate"]),
  upload.single("resume"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    try {
      const ext = path.extname(req.file.originalname).toLowerCase();
      let text = "";

      if (ext === ".pdf") {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        text = pdfData.text;
      } else if (ext === ".docx") {
        const result = await mammoth.extractRawText({ path: req.file.path });
        text = result.value;
      } else {
        return res.status(400).json({ message: "Unsupported file format" });
      }

      text = cleanText(text);

      // Update candidate profile with resume text
      const updatedCandidate = await Candidate.findOneAndUpdate(
        { user: req.user.userId },
        { $set: { resumeText: text } },
        { new: true, runValidators: true }
      );

      // Delete uploaded file from server
      fs.unlinkSync(req.file.path);

      res.json({ message: "Resume uploaded and text extracted", resumeText: text });
    } catch (err) {
      console.error("Error extracting resume text:", err);
      res.status(500).json({ message: "Failed to process resume" });
    }
  }
);

module.exports = router;
