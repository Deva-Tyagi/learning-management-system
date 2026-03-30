const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  issueIdCard,
  bulkIssueIdCards,
  listIdCards,
  updateIdCard,
  deleteIdCard,
  downloadIdCardPdf,
  getStudentIdCards
} = require('../controllers/idCardController');

// Issue new ID Card
router.post('/issue', auth, issueIdCard);
router.post('/bulk-issue', auth, bulkIssueIdCards);

// List all ID Cards (admin/all, student/own for admin panel use)
router.get('/', auth, listIdCards);

// List ID cards for a specific student (for use in student panel)
router.get('/student/:studentId', auth, getStudentIdCards);

// Update an ID Card (status/validity)
router.put('/:id', auth, updateIdCard);

// Delete/Revoke an ID Card
router.delete('/:id', auth, deleteIdCard);

// Download PDF
router.get('/:id/pdf', auth, downloadIdCardPdf);

module.exports = router;
