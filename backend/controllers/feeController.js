const Fee = require('../models/Fee');
const Student = require('../models/Student');
const FeeSchedule = require('../models/FeeSchedule');
const Payment = require('../models/Payment');

exports.addFee = async (req, res) => {
  try {
    const { studentId, amount, date, scheduleId, remarks, mode, transactionId, discount } = req.body;
    const adminId = req.user.id;

    // 1. Basic Validation
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // 2. Installment Logic (Section 5.3)
    let installmentLabel = "Lump Sum";
    if (scheduleId) {
      const schedule = await FeeSchedule.findOne({ _id: scheduleId, adminId });
      if (!schedule) return res.status(404).json({ error: 'Installment record not found' });
      
      const currentAmt = Number(amount);
      const remaining = (schedule.remainingAmount !== undefined ? schedule.remainingAmount : schedule.amount) - currentAmt;
      
      schedule.remainingAmount = Math.max(0, remaining);
      schedule.status = schedule.remainingAmount <= 0 ? 'PAID' : 'PARTIAL';
      schedule.paidAt = new Date(date);
      if (remarks) {
        schedule.remarks.push({ comment: remarks, date: new Date(), adminName: req.user.name || 'Admin' });
      }
      await schedule.save();
      installmentLabel = schedule.label;
    }

    // 3. Create Payment Record (New Engine)
    const newPayment = new Payment({
      studentId,
      enrollmentId: null, // To be linked if available
      scheduleId,
      amount: Number(amount),
      mode: mode || 'CASH',
      transactionId,
      discount: Number(discount || 0),
      paidOn: date,
      notes: remarks,
      adminId
    });
    await newPayment.save();

    // 4. Legacy Support (Sync with Fee/Student models)
    const newFee = new Fee({
      studentId,
      amount: Number(amount),
      date,
      adminId
    });
    await newFee.save();

    student.feesPaid = (student.feesPaid || 0) + Number(amount);
    await student.save();

    res.status(201).json({ message: 'Payment recorded against ' + installmentLabel, payment: newPayment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

exports.updateFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const fee = await Fee.findOne({ _id: id, adminId: req.user.id });
    if (!fee) return res.status(404).json({ error: 'Fee record not found' });

    const diff = Number(amount) - fee.amount;
    if (diff === 0) return res.json({ message: 'No change', fee });

    const student = await Student.findById(fee.studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const newFeesPaid = (student.feesPaid || 0) + diff;
    if (newFeesPaid > (student.totalFees || 0)) {
      return res.status(400).json({ error: 'This update would result in an overpayment.' });
    }

    fee.amount = Number(amount);
    await fee.save();

    student.feesPaid = newFeesPaid;
    await student.save();

    res.json({ message: 'Fee updated successfully', fee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.getFees = async (req, res) => {
  try {
    const fees = await Fee.find({ adminId: req.user.id }).populate('studentId', 'name email totalFees');
    res.status(200).json({ fees });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch fees' });
  }
};
