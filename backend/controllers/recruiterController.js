const JobGroup = require("../models/JobGroup");
const Application = require("../models/Application");
const Candidate = require("../models/Candidate");
const AIInterviewLog = require("../models/AIInterviewLog");
const User = require("../models/User");


exports.getJobGroupCandidates = async (req, res) => {
  try {
    const { jobGroupId } = req.params;

    const jobGroup = await JobGroup.findById(jobGroupId);
    if (!jobGroup)
      return res.status(404).json({ message: "Job Group not found" });

    // Get all applications with candidate info
    const applications = await Application.find({ jobGroup: jobGroupId })
      .populate({
        path: "candidate", // User ref
        select: "name email avatar candidateProfile",
        populate: { path: "candidateProfile", select: "_id" }, // populate candidateProfile id
      });

    // Get all AIInterviewLogs for this JobGroup in one query
    const candidateIds = applications
      .map((app) => app.candidate?.candidateProfile?._id)
      .filter(Boolean);

    const aiLogs = await AIInterviewLog.find({
      jobGroup: jobGroupId,
      candidate: { $in: candidateIds },
    });

    const candidates = applications.map((app) => {
      const user = app.candidate;
      const candidateId = user?.candidateProfile?._id;

      // Find AI log for this candidate
      const ai = aiLogs.find((log) => log.candidate.toString() === candidateId?.toString());

      return {
        applicationId: app._id,
        candidateId: candidateId,
        name: user?.name || "N/A",
        email: user?.email || "N/A",
        avatar: user?.avatar || null,
        totalScore: ai?.weightedTotal || 0,
        status: app.status,
        interviewStatus: ai?.status || "not-scheduled",
        aiOverallScore: ai?.overallScore || null,
        interviewLogId: ai?._id || null,
      };
    });

    // Sort by totalScore descending
    candidates.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

    res.json({ jobGroup, candidates });
  } catch (err) {
    console.error("Error fetching candidates:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------- Shortlist Candidates ----------------
exports.shortlistCandidates = async (req, res) => {
  try {
    const { candidateIds } = req.body; // array of application IDs

    if (!Array.isArray(candidateIds) || candidateIds.length === 0)
      return res.status(400).json({ message: "No candidates selected" });

    await Application.updateMany(
      { _id: { $in: candidateIds } },
      { $set: { status: "shortlisted" } }
    );

    res.json({ message: `${candidateIds.length} candidates shortlisted.` });
  } catch (err) {
    console.error("Error shortlisting candidates:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateCandidateStatus = async (req, res) => {
  try {
    const { candidateIds, status } = req.body;
    const allowedStatuses = ["pending", "shortlisted", "enrolled", "rejected"];

    if (!Array.isArray(candidateIds) || candidateIds.length === 0)
      return res.status(400).json({ message: "No candidates selected" });

    if (!allowedStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    await Application.updateMany(
      { _id: { $in: candidateIds } },
      { $set: { status } }
    );

    res.json({ message: `${candidateIds.length} candidates updated to "${status}".` });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ message: "Server error" });
  }
};