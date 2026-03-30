const express = require('express');
const router = express.Router();
const { 
  markAttendance, 
  getAttendance, 
  getStudentAttendanceStats,
  getBatchAttendanceReport,
  deleteAttendance,
  updateAttendance,
  debugAttendance,
  markAttendanceScan // Added for the new scan route
} = require('../controllers/attendanceController');
const auth = require('../middleware/authMiddleware');

// Mark or update attendance
router.post('/mark', auth, markAttendance);
router.post('/scan', auth, markAttendanceScan); // NEW QR scan route

// Get attendance records (with optional filters)
router.get('/', auth, getAttendance);
router.get('/get', auth, getAttendance); // Alternative endpoint for consistency

// Get attendance statistics for a specific student
router.get('/student/:studentId/stats', auth, getStudentAttendanceStats);

// Get attendance report for a batch
router.get('/batch/report', auth, getBatchAttendanceReport);

// Update specific attendance record
router.put('/:id', auth, updateAttendance);

// Delete attendance record
router.delete('/:id', auth, deleteAttendance);

// Debug route to check attendance data
router.get('/debug', auth, debugAttendance);

module.exports = router;
