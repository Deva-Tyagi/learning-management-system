const express = require('express');
const router = express.Router();
const {
  submitExamResult,
  getExamResults,
  getResultsByExam,
  getResultsByStudent,
  gradeExamResult,
  getExamReports,
  deleteExamResult
} = require('../controllers/examResultController');
const auth = require('../middleware/authMiddleware');

// Submit exam result (for students taking exam)
router.post('/submit', auth, submitExamResult);

// Get all exam results (admin)
router.get('/', auth, getExamResults);

// Get results by exam ID
router.get('/exam/:examId', auth, getResultsByExam);

// Get results by student ID
router.get('/student/:studentId', auth, getResultsByStudent);

// Grade exam result (manual grading)
router.put('/:resultId/grade', auth, gradeExamResult);

// Delete exam result
router.delete('/:resultId', auth, deleteExamResult);

// Report endpoints
router.get('/reports/exam-wise', auth, getExamReports.examWise);
router.get('/reports/course-wise', auth, getExamReports.courseWise);
router.get('/reports/batch-wise', auth, getExamReports.batchWise);
router.get('/reports/date-range', auth, getExamReports.dateRange);

module.exports = router;
