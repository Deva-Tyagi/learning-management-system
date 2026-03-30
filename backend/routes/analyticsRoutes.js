const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { 
  getDashboardAnalytics, 
  getRevenueAnalytics, 
  getLeaderboard,
  getBatchPerformance
} = require('../controllers/analyticsController');

router.get('/dashboard', auth, getDashboardAnalytics);
router.get('/revenue', auth, getRevenueAnalytics);
router.get('/leaderboard', auth, getLeaderboard);
router.get('/batch-performance', auth, getBatchPerformance);

module.exports = router;
