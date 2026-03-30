const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createLiveClass,
  getLiveClasses,
  getStudentLiveClasses,
  updateLiveClass,
  deleteLiveClass
} = require('../controllers/liveClassController');

// All endpoints require some form of auth
// @route   GET /api/live-classes/student
router.get('/student', auth, getStudentLiveClasses);

// Admin-only routes
router.post('/', auth, createLiveClass);
router.get('/', auth, getLiveClasses);
router.put('/:id', auth, updateLiveClass);
router.delete('/:id', auth, deleteLiveClass);

module.exports = router;
