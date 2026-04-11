const express = require('express');
const router = express.Router();
const { addFee, getFees, updateFee } = require('../controllers/feeController');
const { 
  getFeeStats, 
  getFeeStudents,
  getFeeTimeline, 
  addFeeRemark, 
  updateDueDate, 
  getFeeSettings, 
  updateFeeSettings 
} = require('../controllers/feeManagementController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, addFee);
router.put('/update/:id', authMiddleware, updateFee);
router.get('/all', authMiddleware, getFees);

// Dashboard & Management
router.get('/stats', authMiddleware, getFeeStats);
router.get('/students', authMiddleware, getFeeStudents);
router.get('/timeline/:studentId', authMiddleware, getFeeTimeline);
router.post('/remark', authMiddleware, addFeeRemark);
router.post('/update-due-date', authMiddleware, updateDueDate);

// Settings
router.get('/settings', authMiddleware, getFeeSettings);
router.put('/settings', authMiddleware, updateFeeSettings);

module.exports = router;