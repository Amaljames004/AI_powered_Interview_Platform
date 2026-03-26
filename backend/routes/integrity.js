const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const IntegrityLog = require('../models/IntegrityLog');

// Candidate posts a violation event during interview
router.post('/event', authMiddleware(['candidate']), async (req, res) => {
  try {
    const { type, sessionId, timestamp } = req.body;
    const userId = req.user.userId || req.user.id;
    const Candidate = require('../models/Candidate');
    const candidate = await Candidate.findOne({ user: userId });
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    let severity = 'low';
    if (['face_absent','multiple_faces'].includes(type)) severity = 'high';
    else if (type === 'tab_switch') severity = 'medium';
    await IntegrityLog.create({ candidateId: candidate._id, sessionId, type, timestamp: timestamp || new Date(), severity });
    res.json({ logged: true });
  } catch (err) {
    console.error('Integrity log error:', err);
    res.status(500).json({ message: 'Failed to log integrity event' });
  }
});

// Recruiter fetches integrity logs for a specific interview session
router.get('/session/:sessionId', authMiddleware(['recruiter']), async (req, res) => {
  try {
    const logs = await IntegrityLog.find({ sessionId: req.params.sessionId })
      .populate('candidateId', 'name email')
      .sort({ timestamp: 1 });
    res.json(logs);
  } catch (err) {
    console.error('Fetch integrity logs error:', err);
    res.status(500).json({ message: 'Failed to fetch integrity logs' });
  }
});

// Recruiter fetches ALL integrity logs for a candidate across all sessions
router.get('/candidate/:candidateId', authMiddleware(['recruiter']), async (req, res) => {
  try {
    const logs = await IntegrityLog.find({ candidateId: req.params.candidateId })
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch candidate integrity logs' });
  }
});

module.exports = router;
