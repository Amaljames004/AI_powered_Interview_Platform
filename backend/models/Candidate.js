const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Basic Profile Info
    fullName: { type: String, trim: true }, // Optional if you want separate from User.name
    email: { type: String, lowercase: true, trim: true },
    phoneNumber: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other", "Prefer not to say"] },

    // Social Links
    githubUrl: { type: String, trim: true },   // GitHub profile URL
    linkedinUrl: { type: String, trim: true }, // LinkedIn profile URL

    // Education Details
    college: { type: String, trim: true },
    degree: { type: String, trim: true }, // e.g. B.Tech, MCA, BSc CS
    specialization: { type: String, trim: true }, // e.g. Computer Science
    graduationYear: { type: Number, min: 1900, max: new Date().getFullYear() + 10 },
    academicPercentage: { type: Number, min: 0, max: 100 }, // Aggregate %
    backlogs: { type: Number, min: 0, default: 0 }, // Number of backlog subjects

    // Contact Address
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, default: "India" },
      pincode: { type: String, trim: true },
    },

    // Work Experience
    experienceYears: { type: Number, min: 0, max: 50, default: 0 },
    pastEmployers: [
      {
        companyName: { type: String, trim: true },
        role: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date },
        description: { type: String, trim: true },
      },
    ],

    // Skills & Badges
    skills: { type: [String], default: [] }, // e.g. ["JavaScript", "React"]
    skillLevels: {
      // Detailed skill proficiency: e.g. { "JavaScript": "Intermediate" }
      type: Map,
      of: String,
    },
    badges: { type: [String], default: [] }, // E.g. "AWS Certified"

    // Resume & Portfolio
    resumeUrl: { type: String }, // File URL for resume
    portfolioUrl: { type: String, trim: true }, // Personal website or project links

    // Certifications
    certifications: [
      {
        name: { type: String, trim: true },
        issuer: { type: String, trim: true },
        issueDate: { type: Date },
        expiryDate: { type: Date },
        credentialId: { type: String, trim: true },
        credentialUrl: { type: String, trim: true },
      },
    ],

    // Projects
    projects: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        techStack: { type: [String], default: [] },
        projectUrl: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date },
      },
    ],

    // AI Interview & Mini Project history
    interviewHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AIInterviewLog",
      },
    ],
    ProjectSubmissions: [
      {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "MiniProject" },
        submissionUrl: { type: String },
        score: { type: Number, min: 0, max: 100 },
        submittedAt: { type: Date, default: Date.now },
        feedback: { type: String },
      },
    ],

    // Other recruitment info
    willingToRelocate: { type: Boolean, default: false },
    noticePeriodDays: { type: Number, default: 0 },
    expectedCTC: { type: Number, default: 0 }, // Annual INR
    currentCTC: { type: Number, default: 0 },  // Annual INR

  },
  { timestamps: true }
);

// Compound index for faster searching
candidateSchema.index({ skills: 1, college: 1, degree: 1 });

module.exports = mongoose.model("Candidate", candidateSchema);
