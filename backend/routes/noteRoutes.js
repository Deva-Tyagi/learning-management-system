const express = require('express');
const router = express.Router();
const { uploadNote, getNotes, deleteNote, getStudentNotes } = require('../controllers/noteController');
const auth = require('../middleware/authMiddleware');
const { documentUpload } = require('../middleware/uploadMiddleware');

// Routes
router.post('/upload', auth, documentUpload.single('file'), uploadNote);
router.get('/get', auth, getNotes);
router.get('/get-for-student', auth, getStudentNotes);
router.get('/download/:id', auth, require('../controllers/noteController').downloadNote);
router.delete('/delete/:id', auth, deleteNote);

module.exports = router;
