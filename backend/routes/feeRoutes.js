const express = require('express');
const router = express.Router();
const { addFee, getFees, updateFee } = require('../controllers/feeController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, addFee);
router.put('/update/:id', authMiddleware, updateFee);
router.get('/all', authMiddleware, getFees);

module.exports = router;