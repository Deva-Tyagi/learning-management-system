// controllers/enrollmentController.js
const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const FeeSchedule = require('../models/FeeSchedule');
const Student = require('../models/Student');
const Course = require('../models/Course');
const { scheduleRemindersForSchedules } = require('../services/reminder.service');
const { addMonthsFixed } = require('../utils/date.utils');

async function createEnrollment(req, res) {
  const session = await mongoose.startSession();
  let stage = 'validate-inputs';
  try {
    const { studentId, courseId, courseName, doj, scheme, customize = {}, installments } = req.body || {};

    // Presence checks
    if (!studentId) return res.status(400).json({ message: 'studentId is required' }); // [validate]
    if (!doj) return res.status(400).json({ message: 'doj (date of joining) is required' }); // [validate]
    if (!scheme || !['MONTHLY', 'FULL', 'INSTALLMENT'].includes(scheme)) {
      return res.status(400).json({ message: 'scheme must be MONTHLY, FULL, or INSTALLMENT' });
    } // [validate]

    // ObjectId validation (avoid CastError on findById)
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ message: 'Invalid studentId' });
    } // [oid]
    if (courseId && !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: 'Invalid courseId' });
    } // [oid]

    stage = 'load-student';
    const student = await Student.findById(studentId);
    if (!student) return res.status(400).json({ message: 'Student not found' }); // [lookup]

    stage = 'load-course';
    let course = null;
    if (courseId) {
      course = await Course.findById(courseId);
      if (!course) return res.status(400).json({ message: 'Course not found' });
    } // [lookup]

    // Compute fee bases (prefer customize, then course)
    const baseMonthly = customize.monthlyFee ?? course?.monthlyFee ?? 0;
    const baseDuration = customize.durationMonths ?? course?.durationMonths ?? 0;
    const baseTotal = customize.totalFee ?? course?.totalFee ?? 0; // [fees]

    const resolvedCourseName = course?.name || courseName;
    if (!resolvedCourseName) {
      return res.status(400).json({ message: 'courseName missing and courseId not resolved' });
    } // [validate]

    stage = 'start-tx';
    session.startTransaction(); // use MongoDB transaction session [1]

    // Create the enrollment (use Document.save with session)
    stage = 'create-enrollment';
    const enrollmentDoc = {
      studentId,
      courseId: course?._id || undefined,
      courseName: resolvedCourseName,
      adminId: req.user.id,
      doj: new Date(doj),
      scheme,
      registrationFee: 500,
      customizedTotalFee: customize.totalFee,
      monthlyFee: baseMonthly || undefined,
      durationMonths: baseDuration || undefined,
      totalCourseFee:
        scheme === 'MONTHLY'
          ? 500 + Number(baseMonthly) * Number(baseDuration)
          : 500 + Number(baseTotal),
    }; // [fees]

    // IMPORTANT: save with session ensures a real document with _id is returned
    const enr = await new Enrollment(enrollmentDoc).save({ session }); // [2][1]
    if (!enr || !enr._id) {
      return res.status(400).json({ message: 'create-enrollment: missing required fields or failed validation' });
    } // [validate]

    // Build immutable schedule
    stage = 'build-schedule';
    const schedules = [];
    let seq = 1;

    // Registration fee due on DOJ (fixed)
    schedules.push({
      enrollmentId: enr._id,
      studentId,
      sequence: seq++,
      type: 'FULL',
      label: 'Registration Fee',
      amount: 500,
      dueDate: new Date(doj),
      status: 'DUE',
      adminId: req.user.id,
    }); // [fixed]

    if (scheme === 'MONTHLY') {
      if (!(baseMonthly > 0 && baseDuration > 0)) {
        return res.status(400).json({ message: 'Monthly scheme requires monthlyFee > 0 and durationMonths > 0' });
      } // [validate]
      for (let i = 1; i <= baseDuration; i++) {
        schedules.push({
          enrollmentId: enr._id,
          studentId,
          sequence: seq++,
          type: 'MONTHLY',
          label: `Month ${i}`,
          amount: Number(baseMonthly),
          dueDate: addMonthsFixed(new Date(doj), i),
          status: 'DUE',
          adminId: req.user.id,
        });
      } // [fixed]
    } else if (scheme === 'FULL') {
      if (!(baseTotal > 0)) {
        return res.status(400).json({ message: 'Full payment scheme requires totalFee > 0' });
      } // [validate]
      schedules.push({
        enrollmentId: enr._id,
        studentId,
        sequence: seq++,
        type: 'FULL',
        label: 'Full Payment',
        amount: Number(baseTotal),
        dueDate: new Date(doj),
        status: 'DUE',
        adminId: req.user.id,
      }); // [fixed]
    } else if (scheme === 'INSTALLMENT') {
      if (Array.isArray(installments) && installments.length) {
        installments.forEach((ins, idx) => {
          schedules.push({
            enrollmentId: enr._id,
            studentId,
            sequence: seq++,
            type: 'INSTALLMENT',
            label: `Installment ${idx + 1}/${installments.length}`,
            amount: Number(ins.amount),
            dueDate: new Date(ins.dueDate),
            status: 'DUE',
            adminId: req.user.id,
          });
        });
      } else {
        const parts = typeof installments === 'number' ? installments : 2;
        if (!(baseTotal > 0 && parts > 0)) {
          return res.status(400).json({ message: 'Installment scheme requires totalFee > 0 and installments > 0' });
        } // [validate]
        const each = Math.round((Number(baseTotal) / Number(parts)) * 100) / 100;
        for (let i = 1; i <= parts; i++) {
          schedules.push({
            enrollmentId: enr._id,
            studentId,
            sequence: seq++,
            type: 'INSTALLMENT',
            label: `Installment ${i}/${parts}`,
            amount: each,
            dueDate: addMonthsFixed(new Date(doj), i - 1),
            status: 'DUE',
            adminId: req.user.id,
          });
        }
      } // [fixed]
    }

    // Persist schedules and reminder logs atomically
    stage = 'insert-schedules';
    const inserted = await FeeSchedule.insertMany(schedules, { session }); // atomic with session [1]

    stage = 'create-reminders';
    await scheduleRemindersForSchedules(inserted, session); // create pre/on/post logs [1]

    stage = 'commit';
    await session.commitTransaction();
    res.status(201).json({ message: 'Enrollment and schedule created', enrollment: enr, schedules: inserted }); // [ok]
  } catch (err) {
    console.error('createEnrollment error @', stage, err?.message, err);
    try { await session.abortTransaction(); } catch {}
    const msg = `${stage}: ${String(err?.message || 'unknown error')}`;
    if (msg.includes('required') || msg.includes('Invalid') || msg.includes('not found') || msg.includes('requires')) {
      return res.status(400).json({ message: msg });
    } // [handling]
    res.status(500).json({ message: 'Failed to create enrollment', error: msg }); // [handling]
  } finally {
    session.endSession();
  }
}

module.exports = { createEnrollment };