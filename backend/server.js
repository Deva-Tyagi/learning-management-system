const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// ✅ 1. Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false, // Set to false if you're serving a frontend that needs specific CSP, otherwise true
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ✅ 2. Performance (Compression)
app.use(compression());

// ✅ 3. Rate Limiting (Prevent Brute Force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: { msg: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
// Apply limiter only to API routes if needed, or globally
app.use('/api/', limiter);

// ✅ 4. Enable CORS
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',') 
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: function (origin, callback) {
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

// ✅ 5. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// ✅ 6. Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ 7. Routes
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

// Root check route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// ✅ 8. ERROR HANDLING (Global Error Handler)
// Should be the LAST middleware
app.use((err, req, res, next) => {
  console.error('[ERROR HANDLER]:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // stack: process.env.NODE_ENV === 'production' ? 'null' : err.stack
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
