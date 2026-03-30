const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const FeeSchedule = require('../models/FeeSchedule');
const mongoose = require('mongoose');


router.get('/by-student/:studentId', auth, async (req, res) => {
  const { studentId } = req.params;
  if (!mongoose.isValidObjectId(studentId)) {
    return res.status(400).json({ message: 'Invalid studentId' });
  }
  const schedules = await FeeSchedule.find({ studentId, adminId: req.user.id }).sort({ sequence: 1 });
  res.json({ schedules });
});

module.exports = router;
