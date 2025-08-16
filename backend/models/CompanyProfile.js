const mongoose = require("mongoose");

const companyProfileSchema = new mongoose.Schema({
  recruiter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    unique: true
  },
  name: { type: String, required: true, trim: true },
  logo: { type: String, default: "" },
  industry: { type: String, trim: true },
  hiringPolicies: { type: String, trim: true },
  verificationStatus: { type: Boolean, default: false },
  website: { type: String, trim: true },
  location: { type: String, trim: true },

  // References to JobGroups
  jobGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: "JobGroup" }]
}, { timestamps: true });

module.exports = mongoose.model("CompanyProfile", companyProfileSchema);
