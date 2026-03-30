const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  bulkIssueMarksheets,
  listMarksheets,
  downloadMarksheetPdf
} = require('../controllers/marksheetController');

router.post('/bulk-issue', auth, bulkIssueMarksheets);
router.get('/', auth, listMarksheets);
router.get('/:id/pdf', auth, downloadMarksheetPdf);

module.exports = router;
