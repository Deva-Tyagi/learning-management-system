const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { sendWhatsappText } = require('../services/whatsapp.service');

// Mark attendance (enhanced version)
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, date, status, course } = req.body;

    // Validate required fields
    if (!studentId || !date || !status || !course) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    // Validate status
    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({ msg: 'Status must be Present or Absent' });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Check for duplicate attendance on the same date
    const existingAttendance = await Attendance.findOne({ 
      studentId, 
      date: new Date(date).toISOString().split('T')[0],
      adminId: req.user.id
    });

    if (existingAttendance) {
      // Update existing attendance instead of creating duplicate
      existingAttendance.status = status;
      existingAttendance.course = course;
      await existingAttendance.save();
      
      return res.status(200).json({ 
        msg: 'Attendance updated successfully', 
        attendance: existingAttendance 
      });
    }

    // Create new attendance record
    const attendance = new Attendance({ 
      studentId, 
      date: new Date(date), 
      status, 
      course,
      adminId: req.user.id
    });
    
    await attendance.save();
    
    // SEND WHATSAPP ALERT IF ABSENT
    if (status === 'Absent') {
      const phoneToSend = student.guardianPhone || student.phone;
      if (phoneToSend) {
        const formattedDate = new Date(date).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric'
        });
        const message = `Dear Parent/Guardian,\n\nThis is to inform you that your ward, *${student.name}*, is marked as ABSENT today (${formattedDate}) from the ${course} class.\n\nRegards,\nNovatech LMS`;
        
        try {
          await sendWhatsappText(phoneToSend, message);
          console.log(`[WhatsApp] Absence alert sent for ${student.name} to ${phoneToSend}`);
        } catch (smsErr) {
          console.error('[WhatsApp] Failed to send absence alert:', smsErr.message);
        }
      }
    }

    res.status(201).json({ 
      msg: 'Attendance marked successfully', 
      attendance 
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ 
      msg: 'Error marking attendance', 
      error: error.message 
    });
  }
};

// Mark attendance via QR Scan (Instant Present)
exports.markAttendanceScan = async (req, res) => {
  try {
    const { studentId, date, course } = req.body;
    
    if (!studentId || !date || !course) {
      return res.status(400).json({ msg: 'Missing student ID, date or course for scanning' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Invalid QR Code: Student not found' });
    }

    const isoDate = new Date(date).toISOString().split('T')[0];
    const existingAttendance = await Attendance.findOne({ 
      studentId, 
      date: isoDate,
      adminId: req.user.id
    });

    if (existingAttendance) {
      existingAttendance.status = 'Present';
      existingAttendance.course = course;
      await existingAttendance.save();
      
      return res.status(200).json({ 
        msg: 'Already marked, updated to Present', 
        studentName: student.name,
        rollNumber: student.rollNumber,
        photo: student.photo
      });
    }

    const attendance = new Attendance({ 
      studentId, 
      date: new Date(date), 
      status: 'Present', 
      course,
      adminId: req.user.id
    });
    
    await attendance.save();
    
    res.status(201).json({ 
      msg: 'Student marked Present', 
      studentName: student.name,
      rollNumber: student.rollNumber,
      photo: student.photo
    });
  } catch (error) {
    console.error('Error in QR scan attendance:', error);
    res.status(500).json({ msg: 'Scan error', error: error.message });
  }
};

// Get all attendance records with populated student data (FIXED)
exports.getAttendance = async (req, res) => {
  try {
    const { studentId, course, startDate, endDate, batch } = req.query;
    
    // Build query filters
    let query = { adminId: req.user.id };
    
    if (studentId) {
      query.studentId = studentId;
    }
    
    if (course) {
      query.course = course;
    }
    
    // Fix date filtering - ensure proper date parsing
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate + 'T00:00:00.000Z'),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate + 'T00:00:00.000Z') };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate + 'T23:59:59.999Z') };
    }

    console.log('Attendance Query:', query); // Debug log

    let records = await Attendance.find(query)
      .populate('studentId', 'name email course batch rollNumber photo')
      .sort({ date: -1 });

    console.log('Found records:', records.length); // Debug log

    // Filter by batch if specified (since batch is in student data)
    if (batch) {
      records = records.filter(record => 
        record.studentId && record.studentId.batch === batch
      );
    }

    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ 
      msg: 'Error fetching attendance', 
      error: error.message 
    });
  }
};

// Get attendance statistics for a student
exports.getStudentAttendanceStats = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { course, startDate, endDate } = req.query;

    const student = await Student.findById(req.user.id);
    if (!student && !req.user.isAdmin) return res.status(404).json({ msg: 'Unauthorized' });

    // Build query
    let query = { studentId, adminId: student?.adminId || req.user.id };
    
    if (course) {
      query.course = course;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const records = await Attendance.find(query);
    
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'Present').length;
    const absentDays = totalDays - presentDays;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    res.json({
      studentId,
      course: course || 'All courses',
      totalDays,
      presentDays,
      absentDays,
      attendancePercentage: parseFloat(attendancePercentage)
    });
  } catch (error) {
    console.error('Error fetching student attendance stats:', error);
    res.status(500).json({ 
      msg: 'Error fetching attendance statistics', 
      error: error.message 
    });
  }
};

// Get attendance report for a batch
exports.getBatchAttendanceReport = async (req, res) => {
  try {
    const { batch, startDate, endDate, course } = req.query;

    if (!batch || !startDate || !endDate) {
      return res.status(400).json({ 
        msg: 'Batch, start date, and end date are required' 
      });
    }

    // Get all students in the batch
    let studentQuery = { batch, isActive: true, adminId: req.user.id };
    if (course) {
      studentQuery.course = course;
    }
    
    const students = await Student.find(studentQuery);
    
    if (students.length === 0) {
      return res.json([]);
    }

    const studentIds = students.map(s => s._id);
    
    // Get attendance records for these students in the date range
    const attendanceQuery = {
      studentId: { $in: studentIds },
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      adminId: req.user.id
    };
    
    if (course) {
      attendanceQuery.course = course;
    }

    const attendanceRecords = await Attendance.find(attendanceQuery)
      .populate('studentId');

    // Generate report data
    const report = students.map(student => {
      const studentAttendance = attendanceRecords.filter(
        record => record.studentId._id.toString() === student._id.toString()
      );
      
      const totalDays = studentAttendance.length;
      const presentDays = studentAttendance.filter(r => r.status === 'Present').length;
      const absentDays = totalDays - presentDays;
      const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

      return {
        student: {
          _id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          course: student.course,
          batch: student.batch,
          email: student.email
        },
        attendance: {
          totalDays,
          presentDays,
          absentDays,
          attendancePercentage: parseFloat(attendancePercentage),
          records: studentAttendance.map(record => ({
            date: record.date,
            status: record.status,
            course: record.course
          }))
        }
      };
    });

    res.json(report);
  } catch (error) {
    console.error('Error generating batch attendance report:', error);
    res.status(500).json({ 
      msg: 'Error generating attendance report', 
      error: error.message 
    });
  }
};

// Delete attendance record
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await Attendance.findOneAndDelete({ _id: id, adminId: req.user.id });
    
    if (!attendance) {
      return res.status(404).json({ msg: 'Attendance record not found' });
    }
    
    res.json({ msg: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ 
      msg: 'Error deleting attendance record', 
      error: error.message 
    });
  }
};

// Update attendance record
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, course } = req.body;
    
    const attendance = await Attendance.findOneAndUpdate(
      { _id: id, adminId: req.user.id }, 
      { status, course }, 
      { new: true }
    ).populate('studentId', 'name email course batch');
    
    if (!attendance) {
      return res.status(404).json({ msg: 'Attendance record not found' });
    }
    
    res.json({ 
      msg: 'Attendance updated successfully', 
      attendance 
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ 
      msg: 'Error updating attendance record', 
      error: error.message 
    });
  }
};

// Debug route function
exports.debugAttendance = async (req, res) => {
  try {
    const count = await Attendance.countDocuments();
    const sample = await Attendance.find().limit(5).populate('studentId');
    
    res.json({
      totalRecords: count,
      sampleData: sample,
      message: 'Debug info for attendance data'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
