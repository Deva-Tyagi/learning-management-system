const ReminderLog = require('../models/ReminderLog');

async function getReminderLogs(req, res) {
  const { studentId, enrollmentId, scheduleId } = req.query;
  const q = {};
  if (studentId) q.studentId = studentId;
  if (enrollmentId) q.enrollmentId = enrollmentId;
  if (scheduleId) q.scheduleId = scheduleId;

  const logs = await ReminderLog.find(q).sort({ scheduledAt: -1 });
  res.json({ logs });
}

module.exports = { getReminderLogs };
