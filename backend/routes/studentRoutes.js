const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  resetStudentPassword,
  loginStudent,
  previewRegistrationNumber
} = require('../controllers/studentController');
const auth = require('../middleware/authMiddleware');
const logActivity = require('../middleware/activityLogger');
const Student = require('../models/Student');

const { uploadImage, uploadDocument } = require('../config/s3');

// ------------------ Routes for Students -----------------------

// 🔑 Public route for student login (NO auth middleware here!)
router.post('/login', loginStudent);

// All routes below require authentication
router.get('/get', auth, getStudents);
router.get('/preview-registration', auth, previewRegistrationNumber);
router.post('/add', auth, uploadImage.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'document', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
]), addStudent);
router.put('/update/:id', auth, uploadImage.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'document', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
]), updateStudent);
router.delete('/delete/:id', auth, deleteStudent);
router.put('/reset-password/:id', auth, resetStudentPassword);

// ----------- NEW: Student Photo Upload/Update Route -----------
router.post('/photo/:id', auth, uploadImage.single('photo'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });
    // Use .location for S3, fallback to .path for compatibility
    student.photo = req.file.location || req.file.path;
    await student.save();
    res.json({ msg: 'Photo updated', photo: student.photo });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

module.exports = router;
