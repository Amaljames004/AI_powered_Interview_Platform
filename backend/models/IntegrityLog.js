const mongoose = require('mongoose');
const integrityLogSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  sessionId: { type: String, required: true },
  type: {
    type: String,
    enum: ['tab_switch', 'window_blur', 'face_absent', 'multiple_faces', 'screen_share_detected'],
    required: true
  },
  timestamp: { type: Date, default: Date.now },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: function() {
      if (['face_absent','multiple_faces'].includes(this.type)) return 'high';
      if (this.type === 'tab_switch') return 'medium';
      return 'low';
    }
  }
}, { timestamps: true });
module.exports = mongoose.model('IntegrityLog', integrityLogSchema);
