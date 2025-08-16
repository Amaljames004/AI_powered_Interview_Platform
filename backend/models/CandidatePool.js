const mongoose = require("mongoose");

const candidatePoolSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      unique: true, // Each candidate can only be in the pool once
    },
    jobGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobGroup",
      required: true,
    },

    // Overall pool status
    status: {
      type: String,
      enum: ["pending", "shortlisted", "enrolled", "rejected"],
      default: "pending",
    },

    // Score breakdown per category (similar to Application)
    scoreBreakdown: [
      {
        category: {
          type: String,
          enum: ["Technical", "Logic", "Communication", "Confidence", "Traits"],
        },
        score: { type: Number, default: 0 },
        maxScore: { type: Number, default: 20 },
      },
    ],
    totalScore: { type: Number, default: 0 },

    // Future AI-ready fields
    skillScores: {
      type: Map,
      of: new mongoose.Schema(
        {
          score: { type: Number, default: null },       // AI score per skill
          confidence: { type: Number, default: null },  // AI confidence level
          lastEvaluated: { type: Date, default: null },
        },
        { _id: false }
      ),
      default: {},
    },

    communicationScore: { type: Number, default: null },
    confidenceScore: { type: Number, default: null },
    leadershipScore: { type: Number, default: null },
    traits: {
      type: Map,
      of: Number, // e.g., teamwork: 80
      default: {},
    },

    lastAIReview: { type: Date, default: null },
    aiReviewerVersion: { type: String, default: null },

    notes: { type: String, default: "" }, // Recruiter notes or AI comments
  },
  { timestamps: true }
);

// Ensure one candidate per job group
candidatePoolSchema.index({ candidate: 1, jobGroup: 1 }, { unique: true });

// Auto-calculate totalScore
candidatePoolSchema.pre("save", function (next) {
  if (this.scoreBreakdown && this.scoreBreakdown.length > 0) {
    this.totalScore = this.scoreBreakdown.reduce((sum, s) => sum + (s.score || 0), 0);
  }
  next();
});

module.exports = mongoose.model("CandidatePool", candidatePoolSchema);
