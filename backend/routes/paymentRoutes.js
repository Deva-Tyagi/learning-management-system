const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { postPayment, updatePayment } = require('../controllers/paymentController');

router.post('/', auth, postPayment);
router.put('/:id', auth, updatePayment);

module.exports = router;
