const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getTemplates,
  createTemplate,
  deleteTemplate,
  bulkIssueDocuments,
} = require('../controllers/cardTemplateController');

const { upload } = require('../middleware/uploadMiddleware');

router.get('/', auth, getTemplates);
router.post('/', auth, upload.single('backgroundImage'), createTemplate);
router.delete('/:id', auth, deleteTemplate);
router.post('/bulk-issue', auth, bulkIssueDocuments);

module.exports = router;
