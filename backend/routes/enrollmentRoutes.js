// routes/enrollmentRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Import models
const Enrollment = require('../models/Enrollment');
const FeeSchedule = require('../models/FeeSchedule');
const Course = require('../models/Course'); 
const Student = require('../models/Student');

const { createEnrollment, getEnrollments } = require('../controllers/enrollmentController');

router.get('/all', auth, getEnrollments);
router.post('/enroll', auth, createEnrollment);

module.exports = router;