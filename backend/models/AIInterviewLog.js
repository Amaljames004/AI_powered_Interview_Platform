const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  technical: Number,
  communication: Number,
  confidence: Number,
  logic: Number,
  traits: Number,
});

const questionAnswerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String },
  mode: {
    type: String,
    enum: ["text", "audio", "video"],
    default: "text",
  },
  skillTag: String,
  aiEvaluation: String,  // AI feedback for this answer
  score: scoreSchema,    // ✅ Score per question
});

const aiInterviewLogSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    jobGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobGroup",
      required: true,
    },

    questions: [questionAnswerSchema],

    // ✅ Overall aggregated scores
    overallScore: scoreSchema,

    weightedTotal: Number,

    recommendations: [String],

    startTime: Date,
    endTime: Date,

    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled"],
      default: "scheduled",
    },

    meetingLink: String,
    feedback: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIInterviewLog", aiInterviewLogSchema);
