const ReminderLog = require('../models/ReminderLog');
const { tz } = require('../utils/date.utils');

// Build three reminder timestamps around a due date (Asia/Kolkata by default)
function buildReminderTimes(dueDateISO, options = {}) {
  const base = new Date(dueDateISO);
  const hour = options.hour ?? 10; // 10:00 local
  const minute = options.minute ?? 0;

  const makeAt = (d, offsetDays) => {
    const x = new Date(d);
    x.setDate(x.getDate() + offsetDays);
    x.setHours(hour, minute, 0, 0);
    return x;
  };

  return {
    pre: makeAt(base, -2),   // 2 days before due
    on:  makeAt(base, 0),    // on due date
    post: makeAt(base, +1),  // 1 day after
  };
}

// Create ReminderLog rows for one schedule document
async function scheduleRemindersForSchedule(schedule, session) {
  const { pre, on, post } = buildReminderTimes(schedule.dueDate);
  const payloads = [
    { kind: 'PRE_DUE',  scheduledAt: pre },
    { kind: 'ON_DUE',   scheduledAt: on },
    { kind: 'POST_DUE', scheduledAt: post },
  ].map(x => ({
    studentId: schedule.studentId,
    enrollmentId: schedule.enrollmentId,
    scheduleId: schedule._id,
    kind: x.kind,
    scheduledAt: x.scheduledAt,
    status: 'SCHEDULED'
  }));
  await ReminderLog.insertMany(payloads, { session });
}

// Bulk-create reminders for many schedules
async function scheduleRemindersForSchedules(schedules, session) {
  for (const s of schedules) {
    await scheduleRemindersForSchedule(s, session);
  }
}

module.exports = {
  buildReminderTimes,
  scheduleRemindersForSchedule,
  scheduleRemindersForSchedules,
};
