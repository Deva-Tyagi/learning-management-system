// routes/enrollmentRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Import models
const Enrollment = require('../models/Enrollment');
const FeeSchedule = require('../models/FeeSchedule');
const Course = require('../models/Course'); 
const Student = require('../models/Student');

router.post('/enroll', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      studentId,
      courseId,
      doj,                    // Date of Joining from frontend
      scheme,                 // 'MONTHLY', 'FULL', 'INSTALLMENT'
      customize = {},         // { monthlyFee, durationMonths, totalFee }
      installments            // number for INSTALLMENT
    } = req.body;

    // Validation
    if (!studentId || !courseId || !doj || !scheme) {
      return res.status(400).json({ message: 'Missing required fields: studentId, courseId, doj, scheme' });
    }

    // Check if student already paid full fees
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (student.feeStatus === 'paid') {
      return res.status(400).json({ message: 'Student has already paid full fees and cannot be enrolled again.' });
    }

    // Check if duplicate enrollment for same course
    const existing = await Enrollment.findOne({ studentId, courseId });
    if (existing) {
      return res.status(400).json({ message: 'Student is already enrolled in this course.' });
    }

    const joinDate = new Date(doj);

    // Fetch the course to get name and default fees
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Calculate totalCourseFee based on scheme and customize overrides
    let totalCourseFee = 0;
    let monthlyFee = Number(customize.monthlyFee || course.monthlyFee || 0);
    let durationMonths = Number(customize.durationMonths || course.durationMonths || 0);
    let customizedTotalFee = Number(customize.totalFee || course.totalFee || 0);

    if (scheme === 'MONTHLY') {
      if (monthlyFee <= 0 || durationMonths <= 0) {
        return res.status(400).json({ message: 'Monthly fee and duration must be > 0 for MONTHLY scheme' });
      }
      totalCourseFee = monthlyFee * durationMonths;
    } else if (scheme === 'FULL' || scheme === 'INSTALLMENT') {
      totalCourseFee = customizedTotalFee;
      if (totalCourseFee <= 0) {
        return res.status(400).json({ message: 'Total fee must be > 0 for FULL or INSTALLMENT scheme' });
      }
    }

    // Create Enrollment with ALL required fields from your model
    const enrollment = new Enrollment({
      studentId,
      courseId,
      courseName: course.name,              // ← Required
      doj: joinDate,                        // ← Required (your field name is 'doj')
      scheme,
      totalCourseFee,                       // ← Required
      registrationFee: 500,                 // default
      monthlyFee: scheme === 'MONTHLY' ? monthlyFee : undefined,
      durationMonths: scheme === 'MONTHLY' ? durationMonths : undefined,
      customizedTotalFee: scheme !== 'MONTHLY' ? customizedTotalFee : undefined,
      adminId: req.user.id,
    });

    await enrollment.save({ session });

    // Generate FeeSchedule items
    const schedules = [];
    const numInstallments = Number(installments || 2);

    if (scheme === 'MONTHLY') {
      for (let i = 1; i <= durationMonths; i++) {
        const dueDate = new Date(joinDate);
        dueDate.setMonth(dueDate.getMonth() + i); // First payment next month

        schedules.push({
          enrollmentId: enrollment._id,
          studentId,
          sequence: i,
          type: 'MONTHLY',
          label: dueDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
          amount: monthlyFee,
          dueDate,
          status: 'DUE',
          adminId: req.user.id
        });
      }
    } else if (scheme === 'INSTALLMENT') {
      const baseAmount = Math.floor(totalCourseFee / numInstallments);
      let remaining = totalCourseFee;

      for (let i = 1; i <= numInstallments; i++) {
        const amount = i === numInstallments ? remaining : baseAmount;
        remaining -= amount;

        const dueDate = new Date(joinDate);
        dueDate.setMonth(dueDate.getMonth() + i * 2); // Every 2 months – adjust as needed

        schedules.push({
          enrollmentId: enrollment._id,
          studentId,
          sequence: i,
          type: 'INSTALLMENT',
          label: `Installment ${i}/${numInstallments}`,
          amount,
          dueDate,
          status: 'DUE',
          adminId: req.user.id
        });
      }
    } else if (scheme === 'FULL') {
      schedules.push({
        enrollmentId: enrollment._id,
        studentId,
        sequence: 1,
        type: 'FULL',
        label: 'Full Course Fee',
        amount: totalCourseFee,
        dueDate: joinDate, // Due immediately
        status: 'DUE',
        adminId: req.user.id,
      });
    }

    // Save all schedules
    await FeeSchedule.insertMany(schedules, { session });

    // Update student totalFees and current course
    student.totalFees = (student.totalFees || 0) + totalCourseFee;
    student.course = course.name;
    await student.save({ session }); 

    await session.commitTransaction();

    res.status(201).json({
      message: 'Enrollment and fee schedule created successfully!',
      enrollmentId: enrollment._id,
      schedulesGenerated: schedules.length
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Enrollment error:', error);
    res.status(500).json({
      message: 'Failed to create enrollment',
      error: error.message || error.toString()
    });
  } finally {
    session.endSession();
  }
});

module.exports = router;