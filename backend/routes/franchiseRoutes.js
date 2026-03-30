const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/uploadMiddleware');
const auth = require('../middleware/authMiddleware');
const {
  getFranchises,
  addFranchise,
  deleteFranchise
} = require('../controllers/franchiseController');

router.get('/', auth, getFranchises);
router.post('/', auth, upload.fields([
  { name: 'directorPhoto', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'centerPhoto', maxCount: 1 },
  { name: 'otherDocument', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
]), addFranchise);
router.delete('/:id', auth, deleteFranchise);

module.exports = router;
