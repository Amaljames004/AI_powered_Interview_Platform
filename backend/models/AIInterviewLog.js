// models/AIInterviewLog.js
const mongoose = require("mongoose");

const questionAnswerSchema = new mongoose.Schema({
  question: String,
  answer: String,
  mode: { type: String, enum: ["text", "audio", "video"] },
  aiEvaluation: String,
  skillTag: String
});

const aiInterviewLogSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobGroup: { type: mongoose.Schema.Types.ObjectId, ref: "JobGroup", required: true },
  questions: [questionAnswerSchema],
  scores: {
    technicalSkill: Number,
    logicalReasoning: Number,
    communication: Number,
    confidence: Number,
    traits: Number
  },
  weightedTotal: Number,
  recommendations: [String]
}, { timestamps: true });

module.exports = mongoose.model("AIInterviewLog", aiInterviewLogSchema);
