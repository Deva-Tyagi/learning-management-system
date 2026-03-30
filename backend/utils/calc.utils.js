function summarizeSchedules(schedules) {
  let totalDue = 0, totalPaid = 0, overdue = 0, upcoming = 0;
  const now = new Date();
  for (const s of schedules) {
    totalDue += s.amount;
    if (s.status === 'PAID') totalPaid += s.amount;
    if (s.status !== 'PAID' && s.dueDate < now) overdue += s.amount;
    if (s.status !== 'PAID' && s.dueDate >= now) upcoming += s.amount;
  }
  return { totalDue, totalPaid, pending: totalDue - totalPaid, overdue, upcoming };
}

module.exports = { summarizeSchedules };
