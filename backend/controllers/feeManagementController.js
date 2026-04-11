const mongoose = require('mongoose'); // FIXED: Import mongoose
const FeeSchedule = require('../models/FeeSchedule');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

// ==========================================
// 5.1 DASHBOARD OVERVIEW (Clickable Cards)
// ==========================================
exports.getFeeStats = async (req, res) => {
  try {
    const adminId = req.user.id;
    const adminObjId = new mongoose.Types.ObjectId(adminId);
    
    // Note: status 'PAID' = Collected. 'DUE' = Pending or Upcoming based on date. 'OVERDUE' = Overdue.
    const now = new Date();
    
    const [paid, overdue, due, total] = await Promise.all([
      FeeSchedule.aggregate([{ $match: { adminId: adminObjId, status: 'PAID' } }, { $group: { _id: null, sum: { $sum: "$amount" } } }]),
      FeeSchedule.aggregate([{ $match: { adminId: adminObjId, status: 'OVERDUE' } }, { $group: { _id: null, sum: { $sum: "$amount" } } }]),
      FeeSchedule.aggregate([{ $match: { adminId: adminObjId, status: 'DUE', dueDate: { $gt: now } } }, { $group: { _id: null, sum: { $sum: "$amount" } } }]),
      FeeSchedule.aggregate([{ $match: { adminId: adminObjId } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
    ]);

    res.json({
      collected: paid[0]?.sum || 0,
      overdue: overdue[0]?.sum || 0,
      upcoming: due[0]?.sum || 0,
      pending: (total[0]?.sum || 0) - (paid[0]?.sum || 0),
      totalAllTime: total[0]?.sum || 0
    });
  } catch (error) {
    res.status(500).json({ msg: 'Error generating stats', error: error.message });
  }
};

// ==========================================
// 5.2 STUDENT FEE LIST & DRILL-DOWN
// ==========================================
exports.getFeeStudents = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    // Get all enrollments for this admin
    const enrollments = await Enrollment.find({ adminId })
      .populate('studentId', 'name rollNumber phone photo email')
      .populate('courseId', 'name');

    // For each enrollment, calculate totals
    const studentList = await Promise.all(enrollments.map(async (e) => {
      if (!e.studentId) return null;
      
      const schedules = await FeeSchedule.find({ enrollmentId: e._id });
      const paid = schedules.reduce((sum, s) => s.status === 'PAID' ? sum + s.amount : sum, 0);
      const partial = schedules.reduce((sum, s) => s.status === 'PARTIAL' ? sum + (s.amount - (s.remainingAmount || 0)) : sum, 0);
      
      return {
        _id: e._id,
        studentId: e.studentId,
        course: e.courseId || { name: e.courseName },
        enrollment: e,
        totalPaid: paid + partial,
        status: schedules.some(s => s.status === 'OVERDUE') ? 'OVERDUE' : 'OK'
      };
    }));

    res.json(studentList.filter(s => s !== null));
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching fee students', error: error.message });
  }
};

exports.getFeeTimeline = async (req, res) => {
  try {
    const { studentId } = req.params;
    const adminId = req.user.id;
    
    const schedule = await FeeSchedule.find({ studentId, adminId }).sort({ sequence: 1 });
    const enrollment = await Enrollment.findOne({ studentId, adminId }).populate('batchId');

    res.json({ schedule, enrollment });
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching timeline', error: error.message });
  }
};

exports.addFeeRemark = async (req, res) => {
  try {
    const { scheduleId, comment } = req.body;
    const adminId = req.user.id;
    const adminName = req.user.name || 'Admin';

    const schedule = await FeeSchedule.findOneAndUpdate(
      { _id: scheduleId, adminId },
      { $push: { remarks: { comment, adminName, date: new Date() } } },
      { new: true }
    );

    if (!schedule) return res.status(404).json({ msg: 'Record not found' });
    res.json({ msg: 'Remark added', schedule });
  } catch (error) {
    res.status(500).json({ msg: 'Error adding remark', error: error.message });
  }
};

exports.updateDueDate = async (req, res) => {
  try {
    const { scheduleId, newDueDate } = req.body;
    const adminId = req.user.id;

    const schedule = await FeeSchedule.findOneAndUpdate(
      { _id: scheduleId, adminId },
      { dueDate: new Date(newDueDate) },
      { new: true }
    );

    if (!schedule) return res.status(404).json({ msg: 'Record not found' });
    res.json({ msg: 'Due date updated', schedule });
  } catch (error) {
    res.status(500).json({ msg: 'Error updating due date', error: error.message });
  }
};

// ==========================================
// 5.4 SETTINGS
// ==========================================

exports.updateFeeSettings = async (req, res) => {
  try {
    const { registrationFee, feeTemplates } = req.body;
    const adminId = req.user.id;

    const admin = await Admin.findByIdAndUpdate(
      adminId,
      { 'settings.registrationFee': registrationFee, 'settings.feeTemplates': feeTemplates },
      { new: true }
    );

    res.json({ msg: 'Settings updated', settings: admin.settings });
  } catch (error) {
    res.status(500).json({ msg: 'Error updating settings', error: error.message });
  }
};

exports.getFeeSettings = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('settings');
    res.json(admin.settings || { registrationFee: 500, feeTemplates: [] });
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching settings' });
  }
};
