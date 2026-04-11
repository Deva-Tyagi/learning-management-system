const Staff = require('../models/Staff');
const StaffAttendance = require('../models/StaffAttendance');
const StaffSalaryPayment = require('../models/StaffSalaryPayment');
const Holiday = require('../models/Holiday');

// ============================
// ATTENDANCE LOGIC
// ============================

exports.markAttendance = async (req, res) => {
  try {
    const { date, attendanceList } = req.body; // attendanceList: [{staffId, status}]
    const adminId = req.user.id;

    for (let record of attendanceList) {
      await StaffAttendance.findOneAndUpdate(
        { staffId: record.staffId, date, adminId },
        { status: record.status },
        { upsert: true, new: true }
      );
    }
    res.json({ msg: 'Attendance saved successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Error saving attendance', error: error.message });
  }
};

exports.getAttendanceByMonth = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    const records = await StaffAttendance.find({
      adminId: req.user.id,
      date: { $regex: `^${month}` }
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching attendance', error: error.message });
  }
};

// ============================
// HOLIDAY LOGIC
// ============================

exports.addHoliday = async (req, res) => {
  try {
    const { title, date } = req.body;
    const adminId = req.user.id;
    
    // In future: triggers NodeMailer here to send emails to Staff & Students
    
    const holiday = new Holiday({ title, date, adminId });
    await holiday.save();
    res.status(201).json({ msg: 'Holiday added and announced', holiday });
  } catch (error) {
    if(error.code === 11000) return res.status(400).json({ msg: 'A holiday is already announced on this date' });
    res.status(500).json({ msg: 'Error adding holiday', error: error.message });
  }
};

exports.getHolidaysByMonth = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    const holidays = await Holiday.find({
      adminId: req.user.id,
      date: { $regex: `^${month}` }
    });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching holidays', error: error.message });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findOneAndDelete({ _id: req.params.id, adminId: req.user.id });
    if (!holiday) return res.status(404).json({ msg: 'Holiday not found' });
    res.json({ msg: 'Holiday deleted' });
  } catch (error) {
    res.status(500).json({ msg: 'Error deleting holiday', error: error.message });
  }
};

// ============================
// DYNAMIC SALARY LOGIC
// ============================

const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

const isSunday = (dateString) => {
  const date = new Date(dateString);
  return date.getDay() === 0;
};

exports.calculateMonthlySalary = async (req, res) => {
  try {
    const { staffId, month } = req.query; // month defaults to current YYYY-MM
    const adminId = req.user.id;
    const staff = await Staff.findOne({ _id: staffId, adminId });
    
    if (!staff) return res.status(404).json({ msg: 'Staff not found' });
    
    const baseSalary = staff.baseSalary || 0;
    
    // Get holidays this month
    const holidays = await Holiday.find({ adminId, date: { $regex: `^${month}` } });
    const holidayDates = holidays.map(h => h.date);

    // Get attendance this month
    const attendance = await StaffAttendance.find({ staffId, adminId, date: { $regex: `^${month}` } });
    
    // Parse month/year
    const [yearStr, monthStr] = month.split('-');
    const totalDays = getDaysInMonth(Number(yearStr), Number(monthStr));
    
    let extraLeaves = 0;
    
    // Check every day of the month
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${yearStr}-${monthStr}-${String(day).padStart(2, '0')}`;
      
      if (isSunday(dateStr) || holidayDates.includes(dateStr)) continue;
      
      const record = attendance.find(a => a.date === dateStr);
      // If absent or leave, count as an extra leave. Half day is 0.5.
      if (record) {
        if (record.status === 'Absent' || record.status === 'Leave') {
          extraLeaves += 1;
        } else if (record.status === 'Half Day') {
          extraLeaves += 0.5;
        }
      }
      // If no record exists... should we count as absent? Let's assume present by default to not overly penalize missing data.
    }
    
    const perDayRate = baseSalary / 30; // standard accounting
    const deductions = Math.floor(perDayRate * extraLeaves);
    const calculatedSalary = Math.max(0, baseSalary - deductions);
    
    res.json({
      baseSalary, perDayRate, extraLeaves, deductions, calculatedSalary
    });
  } catch (error) {
    res.status(500).json({ msg: 'Salary calculation error', error: error.message });
  }
};

exports.logSalaryPayment = async (req, res) => {
  try {
    const { staffId, month, baseSalary, extraLeaves, deductions, amountPaid, remarks } = req.body;
    
    const payment = new StaffSalaryPayment({
      staffId, month, baseSalary, extraLeaves, deductions, amountPaid, remarks, adminId: req.user.id
    });
    
    await payment.save();
    res.json({ msg: 'Salary payment recorded', payment });
  } catch (error) {
    res.status(500).json({ msg: 'Payment error', error: error.message });
  }
};

exports.getSalaryPayments = async (req, res) => {
  try {
    const { staffId } = req.query;
    const payments = await StaffSalaryPayment.find({ staffId, adminId: req.user.id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ msg: 'Error getting payments', error: error.message });
  }
};
