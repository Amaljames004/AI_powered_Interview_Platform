const express = require("express");
const JobGroup = require("../models/JobGroup");
const CompanyProfile = require("../models/CompanyProfile");
const { authMiddleware } = require("../middleware/auth");
const mongoose = require("mongoose");
const router = express.Router();

// Generate unique 8-char alphanumeric join code
async function generateUniqueJoinCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  let exists = true;

  while (exists) {
    code = Array.from({ length: 8 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
    exists = await JobGroup.exists({ joinCode: code });
  }
  return code;
}

// CREATE a new job group
router.post("/", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ recruiter: req.user.userId });
    if (!company)
      return res.status(404).json({ message: "Company profile not found" });

    const joinCode = await generateUniqueJoinCode();

    const jobGroup = await JobGroup.create({
      company: company._id,
      ...req.body,
      joinCode
    });

    company.jobGroups.push(jobGroup._id);
    await company.save();

    res.status(201).json(jobGroup);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET all job groups for the current recruiter
router.get("/", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ recruiter: req.user.userId })
      .populate({ path: "jobGroups", options: { sort: { createdAt: -1 } } });

    if (!company)
      return res.status(404).json({ message: "Company not found" });

    res.json({
      _id: company._id,
      name: company.name,
      logo: company.logo,
      industry: company.industry,
      website: company.website,
      location: company.location,
      jobGroups: company.jobGroups
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// Public GET by join code
router.get("/public/:joinCode", async (req, res) => {
  try {
    const jobGroup = await JobGroup.findOne({ joinCode: req.params.joinCode })
      .select("title description joinCode skillsRequired miniProject");
    if (!jobGroup)
      return res.status(404).json({ message: "Invalid join code" });

    res.json(jobGroup);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/jobgroups/my
router.get('/my', authMiddleware(['recruiter']), async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ recruiter: req.user.userId })
      .populate({ path: "jobGroups", options: { sort: { createdAt: -1 } } });

    if (!company) return res.status(404).json({ message: 'Company not found' });

    res.json(company.jobGroups);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET full job group and company details
router.get("/:jobGroupId/full", async (req, res) => {
  const { jobGroupId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(jobGroupId)) {
      return res.status(400).json({ message: "Invalid Job Group ID format" });
    }

    const jobGroup = await JobGroup.findById(jobGroupId)
      .populate({
        path: "company",
        model: "CompanyProfile",
        select: "-__v -createdAt -updatedAt",
      })
      .populate({
        path: "applications",
        model: "Application",
        select: "-__v -createdAt -updatedAt",
      })
      .lean();

    if (!jobGroup) {
      return res.status(404).json({ message: "Job group not found in database" });
    }

    if (!jobGroup.company) {
      return res.status(404).json({ message: "Associated company not found" });
    }

    res.json({
      company: jobGroup.company,
      jobGroup: {
        _id: jobGroup._id,
        title: jobGroup.title,
        description: jobGroup.description,
        deadline: jobGroup.deadline,
        skillsRequired: jobGroup.skillsRequired,
        customForms: jobGroup.customForms,
        miniProject: jobGroup.miniProject,
        joinCode: jobGroup.joinCode,
        applications: jobGroup.applications,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error while fetching job group details",
      error: err.message,
    });
  }
});

module.exports = router;
