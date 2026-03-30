const express = require('express');
const router = express.Router();
const {
  getBatches,
  addBatch,
  updateBatch,
  deleteBatch
} = require('../controllers/batchController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getBatches);
router.post('/add', auth, addBatch);
router.put('/update/:id', auth, updateBatch);
router.delete('/delete/:id', auth, deleteBatch);

module.exports = router;
