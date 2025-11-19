const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/auth");
const { 
  getJobGroupCandidates, 
  shortlistCandidates, 
  updateCandidateStatus 
} = require("../controllers/recruiterController");

// Get candidates for a Job Group
router.get(
  "/jobgroup/:jobGroupId/candidates",
  authMiddleware(["recruiter"]),
  getJobGroupCandidates
);

// Shortlist candidates (existing)
router.post(
  "/jobgroup/:jobGroupId/shortlist",
  authMiddleware(["recruiter"]),
  shortlistCandidates
);

// Update candidate status (new)
router.post(
  "/jobgroup/:jobGroupId/update-status",
  authMiddleware(["recruiter"]),
  updateCandidateStatus
);

module.exports = router;
