const mongoose = require("mongoose");

// Skill Requirement Schema
const skillRequirementSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  weight: { type: Number, default: 1, min: 0 } // importance/weightage
});

// Custom Form Schema
const customFormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fields: [
    {
      label: { type: String, required: true },
      type: {
        type: String,
        enum: ["text", "textarea", "number", "select", "checkbox", "radio", "file"],
        default: "text"
      },
      required: { type: Boolean, default: false },
      options: [String] // for select/radio
    }
  ]
});

// JobGroup Schema
const jobGroupSchema = new mongoose.Schema(
  {
    // Relations
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyProfile",
      required: true
    },

    // Job Info
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract"],
      default: "full-time"
    },
    location: { type: String, trim: true },
    workMode: {
      type: String,
      enum: ["onsite", "remote", "hybrid"],
      default: "onsite"
    },
    seniority: {
      type: String,
      enum: ["intern", "junior", "mid", "senior", "lead", "manager"],
      default: "junior"
    },

    // Salary / Compensation
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "INR" },
      isNegotiable: { type: Boolean, default: true }
    },

    // Timeline
    timeline: {
      applicationDeadline: { type: Date, required: true },
      interviewStart: { type: Date },
      finalDecision: { type: Date }
    },
    status: {
      type: String,
      enum: ["open", "closed", "on-hold", "draft"],
      default: "open"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },

    // Skills & Evaluation
    skillsRequired: [skillRequirementSchema],
    softSkills: [skillRequirementSchema],
    evaluationCriteria: {
      technical: { type: Number, default: 0.5 },
      softSkills: { type: Number, default: 0.2 },
      communication: { type: Number, default: 0.15 },
      problemSolving: { type: Number, default: 0.15 }
    },

    // Recruiter Prompt & AI
    recruiterPrompt: { type: String, trim: true },
    aiExtracted: {
      skills: [String],
      softSkills: [String],
      roleSummary: String
    },

    // Custom Hiring Process
    customForms: [customFormSchema],
    miniProject: { type: String, trim: true }, // project link/description

    // Applications
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }],

    // Tags & Visibility
    tags: [String],
    visibility: {
      type: String,
      enum: ["public", "private", "internal"],
      default: "public"
    },

    // Recruiter Sharing
    joinCode: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobGroup", jobGroupSchema);
