const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const resumeController = require('../controllers/resumeController');

// @route   GET /api/resume
// @desc    Get student's saved resume
// @access  Private (Student only)
router.get('/', auth, resumeController.getResume);

// @route   POST /api/resume
// @desc    Save/Update student's resume
// @access  Private (Student only)
router.post('/', auth, resumeController.saveResume);

module.exports = router;
