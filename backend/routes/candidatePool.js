const express = require("express");
const mongoose = require("mongoose");
const CandidatePool = require("../models/CandidatePool");
const Candidate = require("../models/Candidate");
const JobGroup = require("../models/JobGroup");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

/**
 * Utility: Validate ObjectId
 */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * ==========================
 * RECRUITER: Advanced Candidate Selection
 * ==========================
 */
router.post(
  "/jobgroup/:jobGroupId/advanced-selection",
  authMiddleware(["recruiter"]),
  async (req, res) => {
    console.log("----[Advanced Selection Request]----");
    try {
      const { jobGroupId } = req.params;
      console.log("jobGroupId received:", jobGroupId);

      if (!isValidId(jobGroupId)) {
        console.warn("Invalid jobGroupId:", jobGroupId);
        return res.status(400).json({ message: "Invalid jobGroupId" });
      }

      const jobGroup = await JobGroup.findById(jobGroupId);
      console.log("JobGroup fetched:", jobGroup ? jobGroup._id : "NOT FOUND");

      if (!jobGroup) return res.status(404).json({ message: "Job group not found" });

      // Authorization check
      console.log("User companyProfile:", req.user.companyProfile);
      if (!req.user.companyProfile || String(jobGroup.company) !== String(req.user.companyProfile)) {
        console.warn("Unauthorized access attempt by user:", req.user._id);
        return res.status(403).json({ message: "Unauthorized" });
      }

      const {
        filters = {},
        sortBy = "totalScore",
        order = "desc",
        page = 1,
        limit = 20,
        searchQuery = ""
      } = req.body;

      console.log("Filters received:", filters);
      console.log("SortBy:", sortBy, "Order:", order);
      console.log("Pagination -> page:", page, "limit:", limit);
      console.log("Search query:", searchQuery);

      const mongoFilter = { jobGroup: jobGroup._id };

      // Null-safe filter building
      if (filters.status) mongoFilter.status = filters.status;
      if (filters.skills?.length)
        mongoFilter["candidate.skills"] = { $all: filters.skills };
      if (filters.minExperience != null || filters.maxExperience != null) {
        mongoFilter["candidate.experienceYears"] = {};
        if (filters.minExperience != null)
          mongoFilter["candidate.experienceYears"].$gte = filters.minExperience;
        if (filters.maxExperience != null)
          mongoFilter["candidate.experienceYears"].$lte = filters.maxExperience;
      }
      if (filters.minAcademicPercentage != null || filters.maxAcademicPercentage != null) {
        mongoFilter["candidate.academicPercentage"] = {};
        if (filters.minAcademicPercentage != null)
          mongoFilter["candidate.academicPercentage"].$gte = filters.minAcademicPercentage;
        if (filters.maxAcademicPercentage != null)
          mongoFilter["candidate.academicPercentage"].$lte = filters.maxAcademicPercentage;
      }
      if (filters.willingToRelocate != null)
        mongoFilter["candidate.willingToRelocate"] = filters.willingToRelocate;

      // Search functionality
      if (searchQuery.trim()) {
        mongoFilter.$or = [
          { "candidate.name": { $regex: searchQuery, $options: "i" } },
          { "candidate.email": { $regex: searchQuery, $options: "i" } },
          { "candidate.currentRole": { $regex: searchQuery, $options: "i" } },
          { "candidate.skills": { $regex: searchQuery, $options: "i" } }
        ];
      }

      console.log("Mongo Filter built:", JSON.stringify(mongoFilter, null, 2));

      // Pagination
      const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
      console.log("Pagination skip:", skip);

      const [candidates, total] = await Promise.all([
        CandidatePool.find(mongoFilter)
          .populate("candidate")
          .sort({ [sortBy]: order === "asc" ? 1 : -1 })
          .skip(skip)
          .limit(limit),
        CandidatePool.countDocuments(mongoFilter)
      ]);

      console.log("Candidates fetched:", candidates.length);
      console.log("Total candidates matching filter:", total);

      res.json({ candidates, total, page, limit });
    } catch (err) {
      console.error("Error in advanced selection:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/**
 * ==========================
 * RECRUITER: Get Candidate Pool Statistics
 * ==========================
 */
router.get(
  "/jobgroup/:jobGroupId/stats",
  authMiddleware(["recruiter"]),
  async (req, res) => {
    try {
      const { jobGroupId } = req.params;
      if (!isValidId(jobGroupId)) {
        return res.status(400).json({ message: "Invalid jobGroupId" });
      }

      const jobGroup = await JobGroup.findById(jobGroupId);
      if (!jobGroup) return res.status(404).json({ message: "Job group not found" });

      if (!req.user.companyProfile || String(jobGroup.company) !== String(req.user.companyProfile)) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const stats = await CandidatePool.aggregate([
        { $match: { jobGroup: jobGroup._id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            shortlisted: {
              $sum: { $cond: [{ $eq: ["$status", "shortlisted"] }, 1, 0] }
            },
            enrolled: {
              $sum: { $cond: [{ $eq: ["$status", "enrolled"] }, 1, 0] }
            },
            rejected: {
              $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
            }
          }
        }
      ]);

      res.json(stats[0] || { total: 0, shortlisted: 0, enrolled: 0, rejected: 0 });
    } catch (err) {
      console.error("Error fetching candidate pool stats:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/**
 * ==========================
 * Update candidate status
 * ==========================
 */
router.put("/update/:poolId", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const { poolId } = req.params;
    const { status, notes, stage } = req.body;

    if (!isValidId(poolId)) {
      return res.status(400).json({ message: "Invalid poolId" });
    }

    if (!["pending", "shortlisted", "enrolled", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const poolEntry = await CandidatePool.findById(poolId).populate("jobGroup");
    if (!poolEntry) return res.status(404).json({ message: "Candidate not found in pool" });

    if (!poolEntry.jobGroup?.company || String(poolEntry.jobGroup.company) !== String(req.user.companyProfile)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    poolEntry.status = status;
    if (notes !== undefined) poolEntry.notes = notes;
    if (stage !== undefined) poolEntry.stage = stage;
    await poolEntry.save();

    res.json(poolEntry);
  } catch (err) {
    console.error("Error updating candidate:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ==========================
 * Bulk update candidate pool entries
 * ==========================
 */
router.put("/bulk-update", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const { poolIds, status, stage } = req.body;

    if (!Array.isArray(poolIds) || poolIds.length === 0) {
      return res.status(400).json({ message: "No candidate IDs provided" });
    }

    if (!["pending", "shortlisted", "enrolled", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const candidates = await CandidatePool.find({ _id: { $in: poolIds } }).populate("jobGroup");
    const unauthorized = candidates.some(
      (candidate) => !candidate.jobGroup?.company || String(candidate.jobGroup.company) !== String(req.user.companyProfile)
    );

    if (unauthorized) {
      return res.status(403).json({ message: "Unauthorized for some candidates" });
    }

    const updateData = { status };
    if (stage !== undefined) updateData.stage = stage;

    const updated = await CandidatePool.updateMany({ _id: { $in: poolIds } }, { $set: updateData });

    res.json({ message: "Candidate pool updated", modifiedCount: updated.modifiedCount });
  } catch (err) {
    console.error("Error bulk updating pool:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ==========================
 * Add Candidate to Pool
 * ==========================
 */
router.post("/jobgroup/:jobGroupId/add-candidate", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const { jobGroupId } = req.params;
    const { candidateId, source = "manual" } = req.body;

    if (!isValidId(jobGroupId) || !isValidId(candidateId)) {
      return res.status(400).json({ message: "Invalid IDs provided" });
    }

    const jobGroup = await JobGroup.findById(jobGroupId);
    if (!jobGroup) return res.status(404).json({ message: "Job group not found" });

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    if (!req.user.companyProfile || String(jobGroup.company) !== String(req.user.companyProfile)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const existing = await CandidatePool.findOne({
      jobGroup: jobGroup._id,
      candidate: candidate._id
    });

    if (existing) {
      return res.status(400).json({ message: "Candidate already exists in pool" });
    }

    const newPoolEntry = new CandidatePool({
      jobGroup: jobGroup._id,
      candidate: candidate._id,
      source,
      totalScore: 0, // TODO: Replace with scoring logic
      status: "pending",
      addedBy: req.user._id
    });

    await newPoolEntry.save();

    res.status(201).json(newPoolEntry);
  } catch (err) {
    console.error("Error adding candidate to pool:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
