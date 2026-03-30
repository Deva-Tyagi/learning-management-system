const Course = require('../models/Course');
const Student = require('../models/Student');
const Fee = require('../models/Fee');
const ExamResult = require('../models/ExamResult');
const Attendance = require('../models/Attendance');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');

// @route   GET /api/admin/analytics/dashboard
// @desc    Get visual dashboard stats
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const { range, startDate, endDate } = req.query;
    
    // Helper to get date filter
    const getDateFilter = (field = 'createdAt') => {
      if (range === 'custom' && startDate && endDate) {
        return { [field]: { $gte: new Date(startDate), $lte: new Date(endDate) } };
      }
      if (range && range !== 'all') {
        const days = parseInt(range) || 30;
        const start = new Date();
        start.setDate(start.getDate() - days);
        return { [field]: { $gte: start } };
      }
      return {};
    };

    const dateFilter = getDateFilter('createdAt');
    const feeDateFilter = getDateFilter('date'); // Fees use 'date' field, not 'updatedAt'

    const [admin, totalStudents, totalCourses, fees, enrollmentData, studentPotential, studentPaid] = await Promise.all([
      Admin.findById(req.user.id).select('plan planExpiryDate isActive'),
      Student.countDocuments({ adminId: req.user.id }), 
      Course.countDocuments({ adminId: req.user.id }),  
      Fee.find({ ...feeDateFilter, adminId: req.user.id }),
      Student.aggregate([
        { 
          $match: {
            adminId: new mongoose.Types.ObjectId(req.user.id),
            ...(Object.keys(dateFilter).length > 0 ? dateFilter : {})
          }
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } },
        { $limit: 12 }
      ]),
      // Calculate total potential revenue from students
      Student.aggregate([
        { $match: { adminId: new mongoose.Types.ObjectId(req.user.id) } },
        { $group: { _id: null, totalPotential: { $sum: "$totalFees" } } }
      ]),
      // Calculate total paid from all fee transactions
      Fee.aggregate([
        { $match: { adminId: new mongoose.Types.ObjectId(req.user.id) } },
        { $group: { _id: null, totalPaid: { $sum: "$amount" } } }
      ])
    ]);

    const totalPotential = studentPotential[0]?.totalPotential || 0;
    const totalPaid = studentPaid[0]?.totalPaid || 0;
    
    // totalRevenue (in specific period)
    const totalRevenue = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
    // pendingRevenue (overall)
    const pendingRevenue = Math.max(0, totalPotential - totalPaid);
    
    // Format month names
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedEnrollment = enrollmentData.map(d => ({
      month: months[d._id - 1],
      count: d.count
    }));

    res.json({
      subscription: admin,
      summary: {
        totalStudents,
        totalCourses,
        totalRevenue, // Filtered by date range
        pendingRevenue,
        revenueMatch: totalPotential > 0 ? Math.round((totalPaid / totalPotential) * 100) : 0
      },
      enrollmentTrends: formattedEnrollment
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/admin/analytics/revenue
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const revenueByMonth = await Fee.aggregate([
      { 
        $match: { 
          status: 'Paid',
          adminId: new mongoose.Types.ObjectId(req.user.id)
        } 
      },
      {
        $group: {
          _id: { $month: "$updatedAt" },
          amount: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedRevenue = revenueByMonth.map(d => ({
      month: months[d._id - 1],
      amount: d.amount
    }));

    res.json(formattedRevenue);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/admin/analytics/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await ExamResult.aggregate([
      {
        $match: {
          adminId: new mongoose.Types.ObjectId(req.user.id)
        }
      },
      {
        $group: {
          _id: "$studentId",
          avgScore: { $avg: "$percentage" },
          totalExams: { $sum: 1 }
        }
      },
      { $sort: { avgScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      {
        $project: {
          name: '$studentInfo.name',
          rollNumber: '$studentInfo.rollNumber',
          course: '$studentInfo.course',
          photo: '$studentInfo.photo',
          avgScore: 1,
          totalExams: 1
        }
      }
    ]);

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/admin/analytics/batch-performance
exports.getBatchPerformance = async (req, res) => {
    try {
      const performance = await ExamResult.aggregate([
        {
          $match: {
            adminId: new mongoose.Types.ObjectId(req.user.id)
          }
        },
        {
          $lookup: {
            from: 'students',
            localField: 'studentId',
            foreignField: '_id',
            as: 'studentInfo'
          }
        },
        { $unwind: '$studentInfo' },
        {
          $group: {
            _id: '$studentInfo.course',
            avgScore: { $avg: '$percentage' },
            studentCount: { $addToSet: '$studentId' }
          }
        },
        {
            $project: {
                course: '$_id',
                avgScore: { $round: ['$avgScore', 1] },
                studentCount: { $size: '$studentCount' }
            }
        },
        { $sort: { avgScore: -1 } }
      ]);
  
      res.json(performance);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  };
