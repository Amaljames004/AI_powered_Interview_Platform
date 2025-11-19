const express = require("express");
const mongoose = require("mongoose");
const JobGroup = require("../models/JobGroup");
const Application = require("../models/Application");
const CompanyProfile = require("../models/CompanyProfile");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// ---- Helpers ----
async function generateUniqueJoinCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid confusing chars
  let code, exists;
  do {
    code = Array.from({ length: 8 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
    exists = await JobGroup.exists({ joinCode: code });
  } while (exists);
  return code;
}

function parseDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// ---- List current recruiter's job groups (alias for /) ----
router.get("/my", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const recruiterId = req.user.userId;
    const company = await CompanyProfile.findOne({ recruiter: recruiterId });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const groups = await JobGroup.find({ company: company._id })
      .sort({ createdAt: -1 })
      .lean();

    // Add application counts
    const withCounts = await Promise.all(
      groups.map(async (g) => {
        const applicationsCount = await Application.countDocuments({ jobGroup: g._id });
        return {
          _id: g._id,
          title: g.title,
          description: g.description,
          joinCode: g.joinCode,
          deadline: g.timeline?.applicationDeadline,
          applicationsCount, // new field
        };
      })
    );

    res.json(withCounts);
  } catch (err) {
    console.error("Error fetching recruiter job groups:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ---- Create Job Group ----
router.post("/", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const recruiterId = req.user.userId;

    // Ensure recruiter has a company
    const company = await CompanyProfile.findOne({ recruiter: recruiterId });
    if (!company) return res.status(404).json({ message: "Company profile not found" });

    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const payload = {
      company: company._id,
      title: title.trim(),
      description,
      employmentType: req.body.employmentType || "full-time",
      location: req.body.location || "",
      workMode: req.body.workMode || "onsite",
      seniority: req.body.seniority || "junior",
      category: req.body.category || "software", // new field
      benefits: Array.isArray(req.body.benefits) ? req.body.benefits : [], // new field
      interviewMode: req.body.interviewMode || "online", // new field
      recruiterNotes: req.body.recruiterNotes || "", // internal notes
      attachments: Array.isArray(req.body.attachments) ? req.body.attachments : [], // file links

      salary: {
        min: req.body?.salary?.min ?? undefined,
        max: req.body?.salary?.max ?? undefined,
        currency: req.body?.salary?.currency || "INR",
        isNegotiable: req.body?.salary?.isNegotiable ?? true,
      },

      timeline: {
        applicationDeadline: parseDateOrNull(req.body?.timeline?.applicationDeadline),
        interviewStart: parseDateOrNull(req.body?.timeline?.interviewStart),
        finalDecision: parseDateOrNull(req.body?.timeline?.finalDecision),
      },

      status: req.body.status || "draft",
      priority: req.body.priority || "medium",
      skillsRequired: Array.isArray(req.body.skillsRequired) ? req.body.skillsRequired : [],
      softSkills: Array.isArray(req.body.softSkills) ? req.body.softSkills : [],
      evaluationCriteria: {
        technical: req.body?.evaluationCriteria?.technical ?? 0.5,
        softSkills: req.body?.evaluationCriteria?.softSkills ?? 0.2,
        communication: req.body?.evaluationCriteria?.communication ?? 0.15,
        problemSolving: req.body?.evaluationCriteria?.problemSolving ?? 0.15,
      },
      recruiterPrompt: req.body.recruiterPrompt || "",
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      visibility: req.body.visibility || "public",
      customForms: Array.isArray(req.body.customForms) ? req.body.customForms : [],
      miniProject: req.body.miniProject || "",
    };

    if (!payload.timeline.applicationDeadline) {
      return res.status(400).json({ message: "Application deadline is required" });
    }

    const joinCode = await generateUniqueJoinCode();

    const jobGroup = await JobGroup.create({
      ...payload,
      joinCode,
    });

    company.jobGroups.push(jobGroup._id);
    await company.save();

    const full = await JobGroup.findById(jobGroup._id)
      .populate({ path: "company", select: "name _id" })
      .lean();

    res.status(201).json({
      ...full,
      companyName: full?.company?.name || null,
    });
  } catch (err) {
    console.error("Error creating job group:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- List Job Groups (filter + search) ----
router.get("/", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const recruiterId = req.user.userId;
    const company = await CompanyProfile.findOne({ recruiter: recruiterId });
    if (!company) return res.status(404).json({ message: "Company not found" });

    const { status, search } = req.query;
    const filter = { company: company._id };

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const groups = await JobGroup.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: "company", select: "name _id" })
      .lean();

    // Enrich each job group with companyName + applicationsCount
    const withCounts = await Promise.all(
      groups.map(async (g) => {
        const applicationsCount = await Application.countDocuments({ jobGroup: g._id });
        return {
          ...g,
          companyName: g.company?.name || null,
          applicationsCount,
        };
      })
    );

    res.json(withCounts);
  } catch (err) {
    console.error("Error listing job groups:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- Public by join code ----
router.get("/public/:joinCode", async (req, res) => {
  try {
    const job = await JobGroup.findOne({ joinCode: req.params.joinCode })
      .select("-applications -__v")
      .populate({ path: "company", select: "name _id" })
      .lean();

    if (!job) return res.status(404).json({ message: "Invalid join code" });

    res.json({
      ...job,
      companyName: job.company?.name || null,
    });
  } catch (err) {
    console.error("Error fetching by join code:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- Get one (full details) ----
router.get("/:id", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const job = await JobGroup.findById(id)
      .populate({ path: "company", select: "name _id" })
      .populate({ path: "applications", select: "-__v -createdAt -updatedAt" })
      .lean();

    if (!job) return res.status(404).json({ message: "Job group not found" });

    res.json({ ...job, companyName: job.company?.name || null });
  } catch (err) {
    console.error("Error fetching job group:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- Update ----
router.patch("/:id", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const update = {};
    const setIfDefined = (path, val) => {
      if (val !== undefined) update[path] = val;
    };

    [
      "title", "description", "employmentType", "location", "workMode",
      "seniority", "status", "priority", "recruiterPrompt", "visibility",
      "miniProject", "category", "interviewMode", "recruiterNotes"
    ].forEach(f => setIfDefined(f, req.body[f]));

    if (req.body.salary) {
      ["min", "max", "currency", "isNegotiable"].forEach(k =>
        setIfDefined(`salary.${k}`, req.body.salary[k])
      );
    }

    if (req.body.timeline) {
      ["applicationDeadline", "interviewStart", "finalDecision"].forEach(k =>
        setIfDefined(`timeline.${k}`, parseDateOrNull(req.body.timeline[k]))
      );
    }

    if (Array.isArray(req.body.skillsRequired)) setIfDefined("skillsRequired", req.body.skillsRequired);
    if (Array.isArray(req.body.softSkills)) setIfDefined("softSkills", req.body.softSkills);
    if (Array.isArray(req.body.tags)) setIfDefined("tags", req.body.tags);
    if (Array.isArray(req.body.customForms)) setIfDefined("customForms", req.body.customForms);
    if (Array.isArray(req.body.benefits)) setIfDefined("benefits", req.body.benefits);
    if (Array.isArray(req.body.attachments)) setIfDefined("attachments", req.body.attachments);

    if (req.body.evaluationCriteria) {
      ["technical", "softSkills", "communication", "problemSolving"].forEach(k =>
        setIfDefined(`evaluationCriteria.${k}`, req.body.evaluationCriteria[k])
      );
    }

    const updated = await JobGroup.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    )
      .populate({ path: "company", select: "name _id" })
      .lean();

    if (!updated) return res.status(404).json({ message: "Job group not found" });

    res.json({ ...updated, companyName: updated.company?.name || null });
  } catch (err) {
    console.error("Error updating job group:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- Archive (soft delete) ----
router.delete("/:id", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const job = await JobGroup.findById(id);
    if (!job) return res.status(404).json({ message: "Job group not found" });

    job.status = "archived"; // instead of hard delete
    await job.save();

    res.json({ message: "Job group archived" });
  } catch (err) {
    console.error("Error archiving job group:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- Candidate view (full details, public-safe) ----
router.get("/:id/full", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid job group id" });
    }

    const job = await JobGroup.findById(id)
      .select("-applications -__v -updatedAt") // hide sensitive fields
      .populate({
        path: "company",
        select: "name logo industry location website hiringPolicies description",
      })
      .lean();

    if (!job) return res.status(404).json({ message: "Job group not found" });

    res.json({
      jobGroup: job,
      company: job.company,
    });
  } catch (err) {
    console.error("Error fetching candidate job group:", err);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;
