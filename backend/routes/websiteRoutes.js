const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const superAdminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.isSuperAdmin) {
        return res.status(403).json({ msg: 'Access denied. Superadmin only.' });
    }
    next();
};

const {
  resolveWebsite,
  getWebsiteCourses,
  getSingleCourse,
  submitQuery,
  getAdminQueries,
  updateQueryStatus,
  getAllWebsites,
  getWebsiteByAdmin,
  createOrUpdateWebsite
} = require('../controllers/websiteController');

// --- PUBLIC STOREFRONT ROUTES ---
// Determine which client site to show (using custom domain or ID path)
router.get('/resolve/:domainName', resolveWebsite);
// Get that specific admin's courses
router.get('/courses/:adminId', getWebsiteCourses);
// Get a single course by ID (for course detail page)
router.get('/course/:courseId', getSingleCourse);
// Submit contact query for that admin
router.post('/query/:adminId', submitQuery);

// --- ADMIN ROUTES (Institute Owner) ---
router.get('/admin/queries', auth, getAdminQueries);
router.put('/admin/queries/:id', auth, updateQueryStatus);

// --- SUPERADMIN ROUTES (Multi-Tenant Management) ---
router.get('/superadmin/all', auth, superAdminMiddleware, getAllWebsites);
router.get('/superadmin/:adminId', auth, superAdminMiddleware, getWebsiteByAdmin);
router.post('/superadmin/:adminId', auth, superAdminMiddleware, upload.single('logoFile'), createOrUpdateWebsite);

module.exports = router;
