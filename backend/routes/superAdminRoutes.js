const express = require('express');
const { 
    getGlobalSettings,
    updateGlobalSettings,
    deleteClient,
    registerSuperAdmin,
    loginSuperAdmin,
    getAllClients,
    createClient,
    updateClientSubscription,
    getClientStats,
    getClientActivity,
    getPublicSettings,
    submitDemoInquiry,
    getDemoInquiries,
    updateDemoInquiryStatus
} = require('../controllers/superAdminController');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

// Regular routes
router.post('/register', registerSuperAdmin);
router.post('/login', loginSuperAdmin);

// Public branding/settings
router.get('/public/settings', getPublicSettings);
router.post('/public/demo-inquiry', submitDemoInquiry);

// Protected Superadmin routes
const superAdminAuth = (req, res, next) => {
    if (!req.user || !req.user.isSuperAdmin) {
        return res.status(403).json({ msg: 'Access denied. Superadmin only.' });
    }
    next();
};

router.get('/clients', auth, superAdminAuth, getAllClients);
router.post('/clients', auth, superAdminAuth, createClient);
router.put('/clients/:clientId', auth, superAdminAuth, updateClientSubscription);
router.delete('/clients/:clientId', auth, superAdminAuth, deleteClient);
router.get('/stats', auth, superAdminAuth, getClientStats);
router.get('/activity', auth, superAdminAuth, getClientActivity);

// Global settings
router.get('/settings', auth, superAdminAuth, getGlobalSettings);
router.put('/settings', auth, superAdminAuth, updateGlobalSettings);

// Demo Inquiries
router.get('/demo-inquiries', auth, superAdminAuth, getDemoInquiries);
router.put('/demo-inquiries/:id', auth, superAdminAuth, updateDemoInquiryStatus);

module.exports = router;
