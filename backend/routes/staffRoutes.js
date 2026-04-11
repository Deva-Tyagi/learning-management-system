const express = require('express');
const router = express.Router();
const {
  getStaff,
  addStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController');
const auth = require('../middleware/authMiddleware');

const {
  markAttendance,
  getAttendanceByMonth,
  addHoliday,
  getHolidaysByMonth,
  deleteHoliday,
  calculateMonthlySalary,
  logSalaryPayment,
  getSalaryPayments
} = require('../controllers/staffManagementController');

router.get('/', auth, getStaff);
router.post('/add', auth, addStaff);
router.put('/update/:id', auth, updateStaff);
router.delete('/delete/:id', auth, deleteStaff);

// Attendance routes
router.post('/attendance', auth, markAttendance);
router.get('/attendance', auth, getAttendanceByMonth);

// Holiday routes
router.post('/holidays', auth, addHoliday);
router.get('/holidays', auth, getHolidaysByMonth);
router.delete('/holidays/:id', auth, deleteHoliday);

// Salary routes
router.get('/salary/calculate', auth, calculateMonthlySalary);
router.post('/salary/pay', auth, logSalaryPayment);
router.get('/salary/ledger', auth, getSalaryPayments);

module.exports = router;
