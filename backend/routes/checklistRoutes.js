const express = require('express');
const router = express.Router();
const { getPendingDocuments } = require('../controllers/documentChecklistController');
const auth = require('../middleware/authMiddleware');

router.get('/pending', auth, getPendingDocuments);

module.exports = router;
