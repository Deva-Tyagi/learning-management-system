const express = require('express');
const { 
    registerAdmin, 
    loginAdmin, 
    getDashboardData,
    requestOtp,
    updatePasswordWithOtp,
    getAdminProfile,
    updateAdminProfile,
    fixDataOrphans
} = require('../controllers/adminController');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/request-otp', requestOtp);
router.post('/update-password-otp', updatePasswordWithOtp);

router.get('/dashboard', auth, (req, res) => {
  res.json({ msg: `Welcome Admin with ID: ${req.user.id}` });
});

router.get('/dashboard-data', auth, getDashboardData); 
router.get('/profile', auth, getAdminProfile);
router.put('/profile', auth, updateAdminProfile);
router.post('/fix-data', auth, fixDataOrphans);

module.exports = router;
