const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const auth = require('../middleware/authMiddleware');
const logActivity = require('../middleware/activityLogger');

const {
  addCourse,
  getCourses,
  deleteCourse,
  updateCourse,
  toggleCourseStatus,
  getCoursesForNavbar,
  getCourseById,
  getCoursesLite
} = require('../controllers/courseController');

// Public routes (static first)
router.get('/navbar', getCoursesForNavbar); // static path [OK]
router.get('/get', auth, getCoursesLite);   // NEW: must be BEFORE '/:id'

// Admin protected routes
router.get('/', auth, getCourses);
router.post('/add', auth, upload.single('image'), addCourse);
router.put('/:id', auth, upload.single('image'), updateCourse);
router.delete('/:id', auth, deleteCourse);
router.patch('/:id/toggle-status', auth, toggleCourseStatus);

// Parameter route MUST be last so it doesn't swallow '/get'
router.get('/:id', getCourseById);

module.exports = router;
