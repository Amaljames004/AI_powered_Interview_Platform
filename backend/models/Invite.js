const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  token: { type: String, required: true },
  email: { type: String, required: true },
  jobGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobGroup' },
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

// ✅ Fix OverwriteModelError
module.exports = mongoose.models.Invite || mongoose.model('Invite', inviteSchema);
