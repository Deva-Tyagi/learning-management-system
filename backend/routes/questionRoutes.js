const express = require('express');
const router = express.Router();
const {
  addQuestion,
  bulkAddQuestions,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  assignToGroup
} = require('../controllers/questionController');
const auth = require('../middleware/authMiddleware');

router.post('/add', auth, addQuestion);
router.post('/bulk-add', auth, bulkAddQuestions);
router.get('/', auth, getQuestions);
router.put('/:id', auth, updateQuestion);
router.delete('/:id', auth, deleteQuestion);
router.post('/assign-group', auth, assignToGroup);

module.exports = router;
