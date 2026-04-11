const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const { getSubjects, addSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');

router.get('/',         auth, getSubjects);
router.post('/add',     auth, addSubject);
router.put('/:id',      auth, updateSubject);
router.delete('/:id',   auth, deleteSubject);

module.exports = router;
