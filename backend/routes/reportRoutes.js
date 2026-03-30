const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getSummary, getUpcoming, getOverdue } = require('../controllers/reportController');

router.get('/summary', auth, getSummary);
router.get('/upcoming', auth, getUpcoming);
router.get('/overdue', auth, getOverdue);

module.exports = router;
