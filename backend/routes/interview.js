const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const ctrl = require("../controllers/interviewController");
const { authMiddleware } = require("../middleware/auth");

// Recruiter routes
router.post("/upload-csv", upload.single("file"), ctrl.uploadCSV);
router.post("/start", ctrl.startInterview);
router.post("/submit", ctrl.submitAnswers);
router.get("/", ctrl.listInterviews);
 // ✅ added here
router.get("/upcoming", authMiddleware(["candidate"]), ctrl.getUpcomingInterviews);
router.get("/history", authMiddleware(["candidate"]), ctrl.getCandidateHistory);
router.get("/:id", ctrl.getInterviewDetails);

module.exports = router;