const mongoose = require("mongoose");

const skillRequirementSchema = new mongoose.Schema({
  skillName: { type: String, required: true },
  weightage: { type: Number, required: true }
});

const jobGroupSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CompanyProfile",
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  skillsRequired: [skillRequirementSchema],
  customForms: [{ title: String, fields: [String] }],
  miniProject: { type: String },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }],
  joinCode: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model("JobGroup", jobGroupSchema);
