const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Student login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email); // Debug log

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please provide email and password' });
    }

    // Find student by email (case insensitive)
    const student = await Student.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    if (!student) {
      console.log('Student not found for email:', email);
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    console.log('Student found:', student.name, 'ID:', student._id);

    // Check if student is active
    if (!student.isActive) {
      console.log('Student account is deactivated:', student.email);
      return res.status(401).json({ msg: 'Account is deactivated. Contact administrator.' });
    }

    // Verify password using the comparePassword method
    const isMatch = await student.comparePassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    // Update first login status
    if (student.firstLogin) {
      student.firstLogin = false;
      await student.save();
    }

    // Create JWT token
    const payload = {
      user: {
        id: student._id,
        type: 'student',
        course: student.course,
        batch: student.batch,
        email: student.email,
        adminId: student.adminId
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          throw err;
        }
        
        console.log('Login successful for:', student.name);
        res.json({
          success: true,
          token,
          student: {
            id: student._id,
            name: student.name,
            email: student.email,
            course: student.course,
            batch: student.batch,
            rollNumber: student.rollNumber,
            phone: student.phone,
            isFirstLogin: student.firstLogin
          }
        });
      }
    );
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ msg: 'Server error during login', error: error.message });
  }
});

// Get current student profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ msg: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.user.type !== 'student') {
      return res.status(401).json({ msg: 'Access denied. Students only.' });
    }
    
    const student = await Student.findById(decoded.user.id).select('-password');
    
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    if (!student.isActive) {
      return res.status(401).json({ msg: 'Account is deactivated' });
    }

    res.json(student);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(401).json({ msg: 'Invalid token' });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ msg: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.user.id);
    
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Verify current password
    const isMatch = await student.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    // Update password (will be hashed by pre-save hook)
    student.password = newPassword;
    await student.save();

    res.json({ msg: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
