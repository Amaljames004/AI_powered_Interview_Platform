const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["admin", "recruiter", "candidate"],
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },

    // Admin-specific
    adminPrivileges: { type: [String], default: [] },

    // Recruiter-specific
    companyProfile: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyProfile" },

    // Candidate-specific
    candidateProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },

    // Security & verification
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
  },
  { timestamps: true }
);

// Indexes for efficient queries
userSchema.index({ role: 1, companyProfile: 1 });

userSchema.pre("save", function (next) {
  if (this.email) this.email = this.email.toLowerCase();
  next();
});

module.exports = mongoose.model("User", userSchema);
