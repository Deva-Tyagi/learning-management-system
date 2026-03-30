const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  deleteGroup
} = require('../controllers/questionGroupController');
const auth = require('../middleware/authMiddleware');

router.post('/create', auth, createGroup);
router.get('/', auth, getGroups);
router.delete('/:id', auth, deleteGroup);

module.exports = router;
