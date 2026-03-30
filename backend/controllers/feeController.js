const Fee = require('../models/Fee');
const Student = require('../models/Student');

exports.addFee = async (req, res) => {
  try {
    const { studentId, course, amount, date } = req.body;

    // Overpay Protection
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const balance = (student.totalFees || 0) - (student.feesPaid || 0);
    if (balance <= 0) return res.status(400).json({ error: 'Student has already paid full fees.' });
    if (Number(amount) > balance) {
      return res.status(400).json({ error: `Only ₹${balance} balance remains. Cannot accept ₹${amount}.` });
    }

    const newFee = new Fee({
      studentId,
      course,
      amount: Number(amount),
      date,
      adminId: req.user.id
    });

    await newFee.save();

    // Status Synchronization
    student.feesPaid = (student.feesPaid || 0) + Number(amount);
    await student.save();

    res.status(201).json({ message: 'Fee added successfully', fee: newFee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add fee' });
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
