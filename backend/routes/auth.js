// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Candidate = require("../models/Candidate");

let CompanyProfile;
try {
  CompanyProfile = require("../models/CompanyProfile");
} catch {
  CompanyProfile = null; // optional
}

const router = express.Router();

function normalizeRole(raw) {
  if (!raw) return "candidate";
  const r = String(raw).trim().toLowerCase();
  if (["candidate", "student", "user"].includes(r)) return "candidate";
  if (["company", "recruiter", "employer"].includes(r)) return "recruiter";
  if (["admin", "administrator"].includes(r)) return "admin";
  return null;
}

/**
 * POST /api/auth/register
 */
router.post("/register", async (req, res) => {
  try {
    const name = req.body.name || `${req.body.firstName || ""} ${req.body.lastName || ""}`.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const rawRole = req.body.role;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const role = normalizeRole(rawRole);
    if (!role) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Check for existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create base user document
    const user = await User.create({
      role,
      name,
      email,
      password: hashedPassword,
      isActive: role === "recruiter" ? false : true,
    });

    // Candidate profile creation
    if (role === "candidate") {
      const candidate = await Candidate.create({
        user: user._id, // required link back to User
        college: req.body.college || "",
        degree: req.body.degree || "",
        graduationYear: req.body.graduationYear || null,
        resume: req.body.resume || "",
        skills: Array.isArray(req.body.skills)
          ? req.body.skills
          : req.body.skills
          ? String(req.body.skills)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        badges: Array.isArray(req.body.badges) ? req.body.badges : [],
      });

      user.candidateProfile = candidate._id;
      await user.save();
    }

    // Recruiter company profile creation (with check for existing)
    if (role === "recruiter" && CompanyProfile && (req.body.companyName || req.body.company)) {
      try {
        let company = await CompanyProfile.findOne({ recruiter: user._id });

        if (!company) {
          company = await CompanyProfile.create({
            recruiter: user._id,
            name: req.body.companyName || req.body.company || "",
            logo: req.body.companyLogo || "",
            industry: req.body.industry || "",
            hiringPolicies: req.body.hiringPolicies || "",
            website: req.body.website || "",
            location: req.body.location || "",
          });
          console.log("Company profile created:", company._id);
        } else {
          console.log("Company profile already exists for recruiter:", user._id);
        }

        user.companyProfile = company._id;
        await user.save();
      } catch (err) {
        console.error("Error creating or linking company profile:", err);
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Return user info (without password)
    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        companyProfile: user.companyProfile || null,
        candidateProfile: user.candidateProfile || null,
      },
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/auth/login
 */
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user with password, populate candidate and company profiles
    const user = await User.findOne({ email }).select("+password")
      .populate("candidateProfile")
      .populate("companyProfile");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        companyProfile: user.companyProfile || null,
        candidateProfile: user.candidateProfile || null,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
