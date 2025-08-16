const mongoose = require("mongoose");

const scoreBreakdownSchema = new mongoose.Schema({
  category: { 
    type: String, 
    enum: ["Technical", "Logic", "Communication", "Confidence", "Traits"], 
    required: true 
  },
  score: { type: Number, required: true },
  maxScore: { type: Number, default: 20 }
});

const applicationSchema = new mongoose.Schema({
  jobGroup: { type: mongoose.Schema.Types.ObjectId, ref: "JobGroup", required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resume: { type: String },
  formResponses: { type: mongoose.Schema.Types.Mixed },
  miniProjectLink: { type: String },
  status: { type: String, enum: ["pending", "enrolled", "shortlisted", "rejected"], default: "pending" },
  aiInterview: { type: mongoose.Schema.Types.ObjectId, ref: "AIInterviewLog" },
  scoreBreakdown: [scoreBreakdownSchema],
  totalScore: { type: Number, default: 0 }
}, { timestamps: true });

// Ensure a candidate applies only once per job group
applicationSchema.index({ jobGroup: 1, candidate: 1 }, { unique: true });

// Auto-calculate totalScore
applicationSchema.pre("save", function(next) {
  if (this.scoreBreakdown && this.scoreBreakdown.length > 0) {
    this.totalScore = this.scoreBreakdown.reduce((sum, s) => sum + s.score, 0);
  }
  next();
});

module.exports = mongoose.model("Application", applicationSchema);
