const FeeSchedule = require('../models/FeeSchedule');

async function getSummary(req, res) {
  const now = new Date();

  const [all] = await FeeSchedule.aggregate([
    { $match: { adminId: new (require('mongoose').Types.ObjectId)(req.user.id) } },
    {
      $group: {
        _id: null,
        totalDue: { $sum: '$amount' },
        totalPaid: { $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, '$amount', 0] } },
        overdue:   { $sum: { $cond: [{ $and: [{ $ne: ['$status','PAID'] }, { $lt: ['$dueDate', now] }] }, '$amount', 0] } },
        upcoming:  { $sum: { $cond: [{ $and: [{ $ne: ['$status','PAID'] }, { $gte: ['$dueDate', now] }] }, '$amount', 0] } },
      }
    }
  ]);

  const data = all || { totalDue: 0, totalPaid: 0, overdue: 0, upcoming: 0 };
  data.pending = (data.totalDue - data.totalPaid);

  res.json({ summary: data });
}

async function getUpcoming(req, res) {
  const { days = 14 } = req.query;
  const now = new Date();
  const to = new Date(now); to.setDate(now.getDate() + Number(days));
  const items = await FeeSchedule.find({
    adminId: req.user.id,
    status: { $ne: 'PAID' },
    dueDate: { $gte: now, $lte: to }
  }).sort({ dueDate: 1 }).limit(500).lean();
  res.json({ upcoming: items });
}

async function getOverdue(req, res) {
  const now = new Date();
  const items = await FeeSchedule.find({
    adminId: req.user.id,
    status: { $ne: 'PAID' },
    dueDate: { $lt: now }
  }).sort({ dueDate: 1 }).limit(500).lean();
  res.json({ overdue: items });
}

module.exports = { getSummary, getUpcoming, getOverdue };
