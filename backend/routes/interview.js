const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const ctrl = require("../controllers/interviewController");
const { authMiddleware, candidateOnly } = require("../middleware/auth");

// Recruiter routes
router.post("/upload-csv", upload.single("file"), ctrl.uploadCSV);

// Candidate-only routes (recruiters blocked)
router.post("/start", candidateOnly, ctrl.startInterview);
router.post("/submit", candidateOnly, ctrl.submitAnswers);
router.get("/upcoming", candidateOnly, ctrl.getUpcomingInterviews);

router.get("/", ctrl.listInterviews);
router.get("/history", authMiddleware(["candidate"]), ctrl.getCandidateHistory);
router.get("/:id", ctrl.getInterviewDetails);

module.exports = router;