// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Candidate = require("../models/Candidate");
const CompanyProfile = require("../models/CompanyProfile");

const router = express.Router();

function normalizeRole(raw) {
  if (!raw) return "candidate";
  const r = String(raw).trim().toLowerCase();
  if (["candidate", "student", "user"].includes(r)) return "candidate";
  if (["company", "recruiter", "employer"].includes(r)) return "recruiter";
  if (["admin", "administrator"].includes(r)) return "admin";
  return "candidate";
}

/**
 * POST /api/auth/register
 */
router.post("/register", async (req, res) => {
  try {
    const { firstName, middleName, lastName, companyName, email, password, role: rawRole } = req.body;

    const role = normalizeRole(rawRole);
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let name = "";
    if (role === "candidate") {
      if (!firstName || !lastName)
        return res.status(400).json({ message: "First and last name are required for candidates" });
      name = [firstName, middleName, lastName].filter(Boolean).join(" ");
    }

    if (role === "recruiter") {
      if (!companyName)
        return res.status(400).json({ message: "Company name is required for recruiters" });
      name = companyName;
    }

    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    let candidateProfile = null;
    let companyProfile = null;

    if (role === "candidate") {
      candidateProfile = new Candidate({ user: user._id, firstName, middleName, lastName, email });
      await candidateProfile.save();
      user.candidateProfile = candidateProfile._id;
      await user.save();
    }

    if (role === "recruiter") {
      companyProfile = new CompanyProfile({ recruiter: user._id, name: companyName });
      await companyProfile.save();
      user.companyProfile = companyProfile._id;
      await user.save();
    }

    // ✅ Include email in JWT for your invite route
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        candidateProfile: candidateProfile ? candidateProfile._id : null,
        companyProfile: companyProfile ? companyProfile._id : null,
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

    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email }).select("+password")
      .populate("candidateProfile")
      .populate("companyProfile");

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // ✅ Include email in JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
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
