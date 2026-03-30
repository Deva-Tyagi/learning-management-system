// routes/reminderRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getReminderLogs } = require('../controllers/reminderController');

// GET /api/reminders/logs?studentId=&enrollmentId=&scheduleId=
router.get('/logs', auth, getReminderLogs);

module.exports = router;
