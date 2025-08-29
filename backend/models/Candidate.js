const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phoneNumber: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other", "Prefer not to say"] },

    githubUrl: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    portfolioUrl: { type: String, trim: true },

    education: [
      {
        institution: { type: String, trim: true },
        degree: { type: String, trim: true },
        specialization: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date },
        graduationYear: { type: Number, min: 1900, max: new Date().getFullYear() + 10 },
        academicPercentage: { type: Number, min: 0, max: 100 },
        gpa: { type: Number, min: 0, max: 10 },
        backlogs: { type: Number, min: 0, default: 0 },
      },
    ],

    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, default: "India" },
      pincode: { type: String, trim: true },
    },

    pastEmployers: [
      {
        company: { type: String, trim: true },
        position: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date },
        isCurrentJob: { type: Boolean, default: false },
        employmentType: { type: String, enum: ["Full-time", "Part-time", "Internship", "Contract", "Freelance"] },
        description: { type: String, trim: true },
      },
    ],
    experienceYears: { type: Number, min: 0, max: 50, default: 0 },

    skills: { type: [String], default: [] },
    skillLevels: { type: Map, of: String },
    badges: { type: [String], default: [] },

    resumeUrl: { type: String },

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

    projects: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        techStack: { type: [String], default: [] },
        projectUrl: { type: String, trim: true },
        githubRepo: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date },
      },
    ],

    interviewHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "AIInterviewLog" }],
    projectSubmissions: [
      {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "MiniProject" },
        submissionUrl: { type: String },
        score: { type: Number, min: 0, max: 100 },
        submittedAt: { type: Date, default: Date.now },
        feedback: { type: String },
      },
    ],

    willingToRelocate: { type: Boolean, default: false },
    noticePeriodDays: { type: Number, default: 0 },
    expectedCTC: { type: Number, default: 0 },
    currentCTC: { type: Number, default: 0 },

    profileCompletedPercentage: { type: Number, min: 0, max: 100, default: 0 },
    status: { type: String, enum: ["Draft", "Active", "Shortlisted", "Hired", "Rejected"], default: "Draft" },
    preferredLocations: { type: [String], default: [] },
    jobTypePreference: { type: String, enum: ["Full-time", "Internship", "Contract"], default: "Full-time" },
    remotePreference: { type: Boolean, default: false },
    lastLogin: { type: Date },
    source: { type: String, trim: true },
  },
  { timestamps: true }
);

// ✅ Fix: Separate indexes for array fields
candidateSchema.index({ skills: 1 });
candidateSchema.index({ "education.college": 1, "education.degree": 1 });

module.exports = mongoose.model("Candidate", candidateSchema);
