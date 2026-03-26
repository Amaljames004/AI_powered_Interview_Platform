const csv = require("csv-parser");
const fs = require("fs");
const mongoose = require("mongoose");
const Candidate = require("../models/Candidate");
const User = require("../models/User");
const JobGroup = require("../models/JobGroup");
const AIInterviewLog = require("../models/AIInterviewLog");
const { evaluateAnswers, generateQuestions } = require("../services/aiModel"); // Custom AI

// Question generation now handled by aiModel.js
// It calls the Python FastAPI server with FLAN-T5 model

// ---------------- CSV Upload + Scheduling ----------------
exports.uploadCSV = async (req, res) => {
  try {
    const { jobGroupId, date, duration } = req.body;

    if (!req.file) return res.status(400).json({ message: "No CSV file uploaded" });
    if (!jobGroupId) return res.status(400).json({ message: "Job group ID missing" });
    if (!date) return res.status(400).json({ message: "No interview date selected" });

    const durationMinutes = parseInt(duration) || 60; // duration per candidate
    const candidates = [];

    // --- Read CSV ---
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => candidates.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    if (candidates.length === 0) return res.status(400).json({ message: "CSV has no valid rows" });

    let success = 0;
    let processed = 0;

    // --- Base start time 9 AM ---
    const interviewDate = new Date(date);
    if (isNaN(interviewDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Working hours
    const workStartHour = 9;
    const workEndHour = 17;
    const totalSlots = Math.floor((workEndHour - workStartHour) * 60 / durationMinutes);
    if (totalSlots === 0) return res.status(400).json({ message: "Duration too long for a single day" });

    // Calculate interval to distribute candidates across day if fewer than slots
    const intervalMinutes = Math.floor((workEndHour - workStartHour) * 60 / candidates.length);

    for (const row of candidates.slice(0, 50)) {
      processed++;

      const email = (row.email || row.Email || row["E-mail"] || row["Email Address"] || "")
        .trim()
        .toLowerCase();
      if (!email) continue;

      const user = await User.findOne({ email });
      if (!user?.candidateProfile) continue;

      const candidate = await Candidate.findById(user.candidateProfile);
      if (!candidate) continue;

      // Skip if candidate already has an interview log for this job group (any status)
      const existingLog = await AIInterviewLog.findOne({
        candidate: candidate._id,
        jobGroup: jobGroupId
      });
      if (existingLog) continue;

      try {
        // --- Compute start and end times ---
        const startTime = new Date(interviewDate);
        startTime.setHours(workStartHour, 0, 0, 0);

        const offsetMinutes = success * intervalMinutes;
        startTime.setMinutes(startTime.getMinutes() + offsetMinutes);

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + durationMinutes);

        const aiLog = await AIInterviewLog.create({
          candidate: candidate._id,
          jobGroup: jobGroupId,
          startTime,
          endTime,
          status: "scheduled",
        });

        candidate.interviewHistory.push(aiLog._id);
        await candidate.save();

        success++;
      } catch (err) {
        console.error("Scheduling Error:", err.message);
      }

      await new Promise(r => setTimeout(r, 50)); // slight delay
    }

    return res.json({ success, total: processed });
  } catch (err) {
    console.error("CSV Upload Error:", err);
    return res.status(500).json({ message: "Server error during CSV upload" });
  }
};

// ---------------- Start Interview ----------------
exports.startInterview = async (req, res) => {
  try {
    const { candidateId, jobGroupId } = req.body;

    const candidate = await Candidate.findById(candidateId);
    const jobGroup = await JobGroup.findById(jobGroupId);
    if (!candidate || !jobGroup)
      return res.status(404).json({ message: "Candidate or Job Group not found" });

    let existingLog = await AIInterviewLog.findOne({
      candidate: candidateId,
      jobGroup: jobGroupId
    });

    if (existingLog && existingLog.status === "completed") {
      return res.status(403).json({ message: "Interview already completed. You cannot retake it." });
    }

    let log = existingLog || await AIInterviewLog.findOne({
      candidate: candidateId,
      jobGroup: jobGroupId,
      status: { $in: ["scheduled", "in-progress"] },
    });

    // Enforce scheduled time window
    if (log && log.status === "scheduled" && log.startTime && log.endTime) {
      const now = new Date();
      const startWindow = new Date(log.startTime);
      startWindow.setMinutes(startWindow.getMinutes() - 5); // 5 min buffer

      const endWindow = new Date(log.endTime);

      if (now < startWindow) {
        return res.status(403).json({ message: "Interview is not yet open. Please wait until your scheduled time." });
      }
      if (now > endWindow) {
        return res.status(403).json({ message: "The scheduled time for this interview has passed." });
      }
    }

    const requiresQuestions = !log || (log.questions && log.questions.length === 0);

    if (requiresQuestions) {
      console.log("Generating questions for candidate:", candidateId, "skills:", candidate.skills);
      const questions = await generateQuestions(candidate.skills || []);
      console.log(`✅ Successfully generated ${questions.length} questions for candidate ${candidateId}`);
      const formattedQuestions = questions.map(q => ({
        questionId: new mongoose.Types.ObjectId(),
        question: q,
        answer: "",
        mode: "text"
      }));

      const updateFields = {
        status: "in-progress",
        startTime: new Date(),
        questions: formattedQuestions,
        ...(log ? {} : { candidate: candidateId, jobGroup: jobGroupId })
      };

      if (log) {
        await AIInterviewLog.updateOne({ _id: log._id }, { $set: updateFields });
        log = await AIInterviewLog.findById(log._id);
      } else {
        log = await AIInterviewLog.create(updateFields);
        candidate.interviewHistory.push(log._id);
        await candidate.save();
      }
    } else if (log.status === "scheduled") {
      log.status = "in-progress";
      log.startTime = new Date();
      await log.save();
    } else if (log.status === "completed") {
      return res.status(400).json({ message: "Interview already completed" });
    }

    res.json({ logId: log._id, questions: log.questions });
  } catch (err) {
    console.error("Start Interview Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ---------------- Submit Answers (All at Once) ----------------
exports.submitAnswers = async (req, res) => {
  try {
    let logId = req.body.logId || (req.body.get && req.body.get("logId"));
    if (!logId) return res.status(400).json({ message: "logId missing" });

    let answers = req.body.answers || (req.body.get && req.body.get("answers"));
    if (!answers) answers = []; // allow empty array

    if (typeof answers === "string") answers = JSON.parse(answers);

    const interview = await AIInterviewLog.findById(logId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const updatedQuestions = [];

    // Loop through all questions in the interview
    for (const q of interview.questions) {
      // Check if answer was provided in request
      const a = answers.find(ans => ans.questionId === q._id.toString() || ans.id === q._id.toString());

      q.answer = (a?.answerText && a.answerText.trim()) || "No answer provided";
      q.mode = a?.answerMode || "text";

      if (a?.blob) {
        q.audioFile = a.blob; // optional
      }

      // AI evaluation
      try {
        const aiScore = await evaluateAnswers([q.answer]);
        q.score = aiScore[0];
        q.aiEvaluation = aiScore[0].feedback || "";
      } catch (err) {
        console.error("AI evaluation error:", err);
        q.score = { technical: 0, communication: 0, confidence: 0, logic: 0, traits: 0 };
        q.aiEvaluation = "";
      }

      updatedQuestions.push({
        questionId: q._id,
        answer: q.answer,
        mode: q.mode,
        score: q.score,
        aiEvaluation: q.aiEvaluation,
      });
    }

    // ---------------- Force completion ----------------
    interview.status = "completed";

    // Compute overall scores
    const answeredScores = interview.questions.filter(q => q.score);
    if (answeredScores.length > 0) {
      const overall = {
        technical: avg(answeredScores.map(q => q.score.technical || 0)),
        communication: avg(answeredScores.map(q => q.score.communication || 0)),
        confidence: avg(answeredScores.map(q => q.score.confidence || 0)),
        logic: avg(answeredScores.map(q => q.score.logic || 0)),
        traits: avg(answeredScores.map(q => q.score.traits || 0)),
      };
      interview.overallScore = overall;
      interview.weightedTotal = Object.values(overall).reduce((a, b) => a + b, 0) / 5;
    }

    await interview.save();

    res.json({
      message: "Answers submitted successfully",
      status: interview.status,
      updatedQuestions,
      overallScore: interview.overallScore,
      weightedTotal: interview.weightedTotal,
    });
  } catch (err) {
    console.error("Submit Answers Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ---------------- Helper ----------------
function avg(arr) {
  if (!arr || arr.length === 0) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}



// ---------------- List All Interviews ----------------
exports.listInterviews = async (req, res) => {
  try {
    const data = await AIInterviewLog.find()
      .populate("candidate jobGroup")
      .sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    console.error("List Interviews Error:", err);
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
};

// ---------------- Candidate Upcoming Interviews ----------------
exports.getUpcomingInterviews = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const candidate = await Candidate.findOne({ user: userId });
    if (!candidate) return res.status(404).json({ message: "Candidate profile not found" });

    const now = new Date();
    const interviews = await AIInterviewLog.find({
      candidate: candidate._id,
      status: "scheduled",
      startTime: { $gte: now },
    })
      .populate({ path: "jobGroup", populate: { path: "company", select: "name logo" } })
      .sort({ startTime: 1 });

    const upcoming = interviews.map(i => ({
      _id: i._id,
      role: i.jobGroup?.title || "Interview",
      company: i.jobGroup?.company?.name || "Unknown Company",
      companyLogo: i.jobGroup?.company?.logo || null,
      date: i.startTime,
      meetingLink: i.meetingLink || null
    }));

    res.json(upcoming);
  } catch (err) {
    console.error("Upcoming Interviews Error:", err);
    res.status(500).json({ message: "Failed to fetch interviews", error: err.message });
  }
};

// ---------------- Interview Details ----------------
exports.getInterviewDetails = async (req, res) => {
  try {
    const interview = await AIInterviewLog.findById(req.params.id)
      .populate("candidate jobGroup");

    if (!interview) return res.status(404).json({ message: "Interview not found" });
    res.json(interview);
  } catch (err) {
    console.error("Interview Details Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getCandidateHistory = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;

    const candidate = await Candidate.findOne({ user: userId });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    const interviews = await AIInterviewLog.find({ candidate: candidate._id })
      .populate({
        path: "jobGroup",
        populate: { path: "company", select: "name logo" },
      })
      .sort({ startTime: -1 });

    const data = interviews.map((i) => ({
      _id: i._id,
      role: i.jobGroup?.title || "Interview",
      company: i.jobGroup?.company?.name || "Unknown Company",
      companyLogo: i.jobGroup?.company?.logo || null,
      date: i.startTime,
      status: i.status,
    }));

    res.json(data);
  } catch (err) {
    console.error("Candidate History Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};