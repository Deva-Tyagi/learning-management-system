const cron = require('node-cron');
const ReminderLog = require('../models/ReminderLog');
const FeeSchedule = require('../models/FeeSchedule');
const Student = require('../models/Student');
const { sendWhatsappText } = require('./whatsapp.service');

// Format a simple WhatsApp message
function buildMessage(student, schedule) {
  const due = new Date(schedule.dueDate).toLocaleDateString('en-IN');
  return `Dear ${student.name}, your coaching fee of ₹${schedule.amount} for ${schedule.label} is due on ${due}. Please ignore if already paid.`;
}

async function tickReminders() {
  const now = new Date();
  const pending = await ReminderLog.find({
    status: 'SCHEDULED',
    scheduledAt: { $lte: now }
  }).limit(100).sort({ scheduledAt: 1 }).lean();

  for (const log of pending) {
    try {
      const [student, schedule] = await Promise.all([
        Student.findById(log.studentId).lean(),
        FeeSchedule.findById(log.scheduleId).lean()
      ]);

      if (!student || !schedule) {
        await ReminderLog.findByIdAndUpdate(log._id, { status: 'FAILED', error: 'Missing student/schedule' });
        continue;
      }

      // Expect student.phone to be a WhatsApp-enabled number in international format
      const msg = buildMessage(student, schedule);
      const resp = await sendWhatsappText(student.phone, msg);

      await ReminderLog.findByIdAndUpdate(log._id, {
        status: 'SENT',
        sentAt: new Date(),
        providerId: resp?.messages?.id || resp?.messages?.wamid || 'NA'
      });
    } catch (err) {
      await ReminderLog.findByIdAndUpdate(log._id, { status: 'FAILED', error: String(err.message || err) });
    }
  }
}

function startSchedulers() {
  // Every minute; timezone via node-cron option
  cron.schedule('* * * * *', () => {
    tickReminders().catch(() => {});
  }, { timezone: process.env.APP_TIMEZONE || 'Asia/Kolkata' });
}

module.exports = { startSchedulers };
