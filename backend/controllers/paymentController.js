const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const FeeSchedule = require('../models/FeeSchedule');
const Student = require('../models/Student');

async function postPayment(req, res) {
  const session = await mongoose.startSession();
  try {
    const { scheduleId, amount, mode = 'CASH', notes } = req.body;

    session.startTransaction();

    const schedule = await FeeSchedule.findOne({ _id: scheduleId, adminId: req.user.id }).session(session);
    if (!schedule) throw new Error('Schedule item not found');
    if (schedule.status === 'PAID') throw new Error('Already paid');

    // Overpay Protection
    const student = await Student.findById(schedule.studentId);
    if (!student) throw new Error('Student not found');
    const balance = (student.totalFees || 0) - (student.feesPaid || 0);
    if (balance <= 0) throw new Error('Student has already paid full fees.');
    if (amount > balance) throw new Error(`Only ₹${balance} balance remains. Cannot accept ₹${amount}.`);

    const payment = await Payment.create([{
      studentId: schedule.studentId,
      enrollmentId: schedule.enrollmentId,
      scheduleId: schedule._id,
      amount,
      mode,
      notes,
      adminId: req.user.id
    }], { session });

    schedule.status = 'PAID';
    schedule.paidAt = new Date();
    schedule.paymentId = payment._id;
    await schedule.save({ session });

    // Status Synchronization
    student.feesPaid = (student.feesPaid || 0) + amount;
    await student.save({ session }); 

    await session.commitTransaction();
    res.status(201).json({ message: 'Payment recorded', payment: payment, schedule });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Payment failed', error: err.message });
  } finally {
    session.endSession();
  }
}

async function updatePayment(req, res) {
  const { id } = req.params;
  const { amount, mode, date, notes } = req.body;
  try {
    const payment = await Payment.findOne({ _id: id, adminId: req.user.id });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const diff = amount - payment.amount;
    payment.amount = amount || payment.amount;
    payment.mode = mode || payment.mode;
    payment.date = date || payment.date;
    payment.notes = notes || payment.notes;
    await payment.save();

    // Update student feesPaid with overpay check
    if (diff !== 0) {
      const student = await Student.findById(payment.studentId);
      if (!student) throw new Error('Student not found');
      const newFeesPaid = (student.feesPaid || 0) + diff;
      if (newFeesPaid > (student.totalFees || 0)) {
        throw new Error('This change would result in an overpayment.');
      }
      student.feesPaid = newFeesPaid;
      await student.save();
    }

    res.json({ message: 'Payment updated successfully', payment });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
}

module.exports = { postPayment, updatePayment };
