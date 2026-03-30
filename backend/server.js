const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// Enable CORS
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',') 
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/super-admin', require('./routes/superAdminRoutes'));

// ✅ Platform Protection (Global Maintenance Switch)
const maintenanceMiddleware = require('./middleware/maintenanceMiddleware');
app.use(maintenanceMiddleware);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/fee', require('./routes/feeRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/exam-results', require('./routes/examResultRoutes'));
app.use('/api/student-auth', require('./routes/studentAuthRoutes'));
app.use('/api/student-exams', require('./routes/studentExamRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/id-cards', require('./routes/idCardRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/fees/schedule', require('./routes/feesScheduleRoutes'));
app.use('/api/franchises', require('./routes/franchiseRoutes'));
app.use('/api/templates', require('./routes/cardTemplateRoutes'));
app.use('/api/admit-cards', require('./routes/admitCardRoutes'));
app.use('/api/marksheets', require('./routes/marksheetRoutes'));
app.use('/api/question-groups', require('./routes/questionGroupRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/live-classes', require('./routes/liveClassRoutes'));
app.use('/api/batches', require('./routes/batchRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// startSchedulers();


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
