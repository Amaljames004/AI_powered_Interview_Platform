const express = require("express");
const mongoose = require("mongoose");
const Application = require("../models/Application");
const JobGroup = require("../models/JobGroup");
const CompanyProfile = require("../models/CompanyProfile");

const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

/**
 * ==========================
 * CANDIDATE ROUTES
 * ==========================
 */

// Apply to a job group using join code
router.post("/apply/:joinCode", authMiddleware(["candidate"]), async (req, res) => {
  try {
    const jobGroup = await JobGroup.findOne({ joinCode: req.params.joinCode });
    if (!jobGroup) return res.status(404).json({ message: "Job group not found" });

    const existing = await Application.findOne({
      jobGroup: jobGroup._id,
      candidate: req.user.userId
    });
    if (existing) return res.status(400).json({ message: "Already applied" });

    const body = req.body || {};

    const application = await Application.create({
      jobGroup: jobGroup._id,
      candidate: req.user.userId,
      resume: body.resume || "",
      formResponses: body.formResponses || {}
    });

    res.status(201).json(application);
  } catch (err) {
    console.error("Error in /apply:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get candidate's applications
router.get("/my-applications", authMiddleware(["candidate"]), async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.userId })
      .populate({
        path: "jobGroup",
        select: "title description joinCode timeline status company",
        populate: {
          path: "company",
          select: "name logo industry location website hiringPolicies"
        }
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Withdraw application
router.delete("/withdraw/:applicationId", authMiddleware(["candidate"]), async (req, res) => {
  try {
    const app = await Application.findOne({
      _id: req.params.applicationId,
      candidate: req.user.userId
    });
    if (!app) return res.status(404).json({ message: "Application not found" });

    await Application.deleteOne({ _id: app._id });
    res.json({ message: "Application withdrawn successfully" });
  } catch (err) {
    console.error("Error in /withdraw:", err);
    res.status(500).json({ message: err.message });
  }
});

// Edit pending application
router.put("/edit/:applicationId", authMiddleware(["candidate"]), async (req, res) => {
  try {
    const app = await Application.findOne({
      _id: req.params.applicationId,
      candidate: req.user.userId,
      status: "pending"
    });
    if (!app) return res.status(400).json({ message: "Cannot edit this application" });

    const { resume, formResponses } = req.body;
    if (resume) app.resume = resume;
    if (formResponses) app.formResponses = formResponses;

    await app.save();
    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ==========================
 * RECRUITER ROUTES
 * ==========================
 */

// Get all applications for a job group
router.get("/jobgroup/:jobGroupId", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const { jobGroupId } = req.params;

    if (!jobGroupId || !mongoose.Types.ObjectId.isValid(jobGroupId)) {
      return res.status(400).json({ message: "Invalid jobGroupId" });
    }

    const jobGroup = await JobGroup.findById(jobGroupId);
    if (!jobGroup) return res.status(404).json({ message: "Job group not found" });

    const company = await CompanyProfile.findOne({ recruiter: req.user.userId });
    if (!company) return res.status(403).json({ message: "Recruiter profile incomplete" });

    if (jobGroup.company.toString() !== company._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { status, sortBy = "createdAt", order = "desc" } = req.query;
    const filter = { jobGroup: jobGroup._id };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate("candidate", "name email")
      .sort({ [sortBy]: order === "asc" ? 1 : -1 });

    res.json(applications);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update single application status
router.put("/update/:applicationId", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const app = await Application.findById(req.params.applicationId).populate("jobGroup");
    if (!app) return res.status(404).json({ message: "Application not found" });

    const company = await CompanyProfile.findOne({ recruiter: req.user.userId });
    if (!company) return res.status(403).json({ message: "Recruiter profile incomplete" });

    if (app.jobGroup.company.toString() !== company._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { status, notes } = req.body;
    const allowedStatuses = ["pending", "shortlisted", "enrolled", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    app.status = status;
    if (notes) app.notes = notes;
    await app.save();

    res.json(app);
  } catch (err) {
    console.error("Update route error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Bulk update applications
router.put("/bulk-update", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const { applicationIds, status } = req.body;
    const allowedStatuses = ["pending", "shortlisted", "enrolled", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Application.updateMany(
      { _id: { $in: applicationIds } },
      { $set: { status } }
    );

    res.json({ message: "Applications updated", modifiedCount: updated.modifiedCount });
  } catch (err) {
    console.error("Bulk update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ==========================
 * ADMIN ROUTES
 * ==========================
 */

router.get("/all", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { status, jobGroupId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (jobGroupId) filter.jobGroup = jobGroupId;

    const applications = await Application.find(filter)
      .populate("candidate", "name email")
      .populate("jobGroup", "title joinCode timeline")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
