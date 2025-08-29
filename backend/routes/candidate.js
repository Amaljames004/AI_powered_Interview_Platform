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
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error("Only PDF and DOCX resumes are allowed"));
    }
    cb(null, true);
  },
});

// ==================
// Helper: clean extracted text
// ==================
function cleanText(text) {
  if (!text) return "";
  return text
    .replace(/\u200b/g, " ")
    .replace(/\u2011/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

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
// UPLOAD resume and extract text
// =====================
router.post(
  "/upload/resume",
  authMiddleware(["candidate"]),
  upload.single("resume"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filePath = req.file.path;

    try {
      // 🔹 Step 1: Try resume-parser if available & compatible
      let parsed = {};
      try {
        if (ResumeParser && typeof ResumeParser.run === "function") {
          // Many versions require an output directory and return path or object
          const outDir = path.join("uploads", "parsed_json");
          fs.mkdirSync(outDir, { recursive: true });
          const result = await ResumeParser.run(filePath, outDir);
          // result may be a path to a json file or an object; handle both
          if (result && typeof result === "string" && result.endsWith(".json")) {
            try {
              const jsonText = fs.readFileSync(result, "utf8");
              parsed = JSON.parse(jsonText);
            } catch (readErr) {
              console.warn("Could not read resume-parser JSON:", readErr.message);
            }
          } else if (result && typeof result === "object") {
            parsed = result;
          }
          console.log("Parsed Resume Data (resume-parser):", parsed);
        } else {
          console.warn("resume-parser not usable: missing `run` method. Skipping it.");
        }
      } catch (e) {
        console.warn("resume-parser failed:", e?.message || e);
      }

      // 🔹 Step 2: Fallback parsing for missing fields (extract raw text)
      const ext = path.extname(req.file.originalname).toLowerCase();
      let rawText = "";

      try {
        if (ext === ".pdf") {
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(dataBuffer);
          rawText = pdfData.text || "";
        } else if (ext === ".docx") {
          const result = await mammoth.extractRawText({ path: filePath });
          rawText = result.value || "";
        } else {
          // .doc or others - we already filtered in multer, but just in case
          rawText = "";
        }
      } catch (textErr) {
        console.warn("Raw text extraction failed:", textErr?.message || textErr);
      }

      rawText = cleanText(rawText);
      if (rawText.length > 50000) rawText = rawText.substring(0, 50000);

      // 🔹 Build updateData
      // Per your request: DO NOT store firstName/middleName/lastName/email from resume.
      const updateData = {
        // firstName: (ignored)
        // middleName: (ignored)
        // lastName: (ignored)
        // email: (ignored)
        phoneNumber:
          (parsed && parsed.phone) ||
          (rawText.match(/\+?\d{10,15}/)?.[0] || ""),
        skills: parsed?.skills?.length ? parsed.skills : extractSkills(rawText),
        education: parsed?.education?.length
          ? parsed.education
          : extractEducation(rawText),
        pastEmployers: parsed?.experience?.length ? parsed.experience : [],
        resumeText: rawText,
        resumeUrl: req.file.path,
      };

      // Remove null/undefined
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] == null) delete updateData[key];
      });

      // Save in Candidate schema (relaxed validators to avoid schema conflicts)
      const updatedCandidate = await Candidate.findOneAndUpdate(
        { user: req.user.userId },
        { $set: updateData },
        { new: true, runValidators: false }
      );

      console.log("Update Data to DB:", updateData);

      res.json({
        message: "Resume uploaded, parsed & stored",
        parsedData: parsed,
        candidate: updatedCandidate,
      });
    } catch (err) {
      console.error("Resume parsing error:", err);
      res.status(500).json({ message: "Failed to parse resume" });
    } finally {
      // Always cleanup uploaded file
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete temp upload:", err);
      });
    }
  }
);

// 🔹 Helper functions
function extractSkills(text) {
  const skillKeywords = [
    "JavaScript",
    "React",
    "Node.js",
    "MongoDB",
    "Python",
    "Java",
    "C++",
    "AWS",
    "SQL",
  ];
  const lower = (text || "").toLowerCase();
  return skillKeywords.filter((skill) =>
    lower.includes(skill.toLowerCase())
  );
}

function extractEducation(text) {
  const edu = [];
  const regex = /(B\.?Tech|M\.?Tech|Bachelor|Master|BSc|MSc|MBA|PhD).{0,50}/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    edu.push({ degree: match[0] });
  }
  return edu;
}

module.exports = router;
