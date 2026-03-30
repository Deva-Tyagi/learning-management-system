const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  bulkIssueAdmitCards,
  listAdmitCards,
  downloadAdmitCardPdf
} = require('../controllers/admitCardController');

router.post('/bulk-issue', auth, bulkIssueAdmitCards);
router.get('/', auth, listAdmitCards);
router.get('/:id/pdf', auth, downloadAdmitCardPdf);

module.exports = router;
