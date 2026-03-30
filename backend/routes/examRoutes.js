const express = require('express');
const router = express.Router();
const { 
  createExam, 
  getExams, 
  getExamById,
  updateExam,
  deleteExam,
  getExamsByBatch,
  activateDeactivateExam
} = require('../controllers/examController');
const auth = require('../middleware/authMiddleware');

// Create new exam
router.post('/create', auth, createExam);

// Get all exams (admin)
router.get('/', auth, getExams);

// Get exam by ID
router.get('/:id', auth, getExamById);

// Get exams by batch and course
router.get('/batch/:batch/:course', auth, getExamsByBatch);

// Update exam
router.put('/:id', auth, updateExam);

// Delete exam
router.delete('/:id', auth, deleteExam);

// Activate/Deactivate exam
router.patch('/:id/toggle-status', auth, activateDeactivateExam);

module.exports = router;
