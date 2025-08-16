const express = require("express");
const router = express.Router();
const CompanyProfile = require("../models/CompanyProfile");
const { authMiddleware } = require("../middleware/auth");

// Create or update company profile
router.post("/", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const { name, logo, industry, hiringPolicies, website, location } = req.body;

    if (!name) return res.status(400).json({ message: "Company name is required" });

    let profile = await CompanyProfile.findOne({ recruiter: req.user.userId });

    if (profile) {
      // Partial update: only set fields if defined
      if (name !== undefined) profile.name = name;
      if (logo !== undefined) profile.logo = logo;
      if (industry !== undefined) profile.industry = industry;
      if (hiringPolicies !== undefined) profile.hiringPolicies = hiringPolicies;
      if (website !== undefined) profile.website = website;
      if (location !== undefined) profile.location = location;

      await profile.save();
      return res.json({ message: "Company profile updated", profile });
    }

    // Create new profile
    profile = await CompanyProfile.create({
      recruiter: req.user.userId,
      name,
      logo,
      industry,
      hiringPolicies,
      website,
      location
    });

    res.status(201).json({ message: "Company profile created", profile });
  } catch (err) {
    console.error("Error in company profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get company profile (recruiter only)
router.get("/", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ recruiter: req.user.userId }).populate("jobGroups");
    if (!profile) return res.status(404).json({ message: "No company profile found" });
    res.json(profile);
  } catch (err) {
    console.error("Error fetching company profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
