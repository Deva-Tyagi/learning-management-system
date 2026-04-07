const Resume = require('../models/Resume');
const Student = require('../models/Student');

// Get current student's resume
exports.getResume = async (req, res) => {
  try {
    const studentId = req.user.id;
    let resume = await Resume.findOne({ studentId });

    if (!resume) {
      // If no resume exists, return null or a default structure
      // But we need to keep the adminId which we can get from the student model
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ msg: 'Student profile not found' });
      }
      
      return res.json({ 
        msg: 'No resume found', 
        resume: null,
        studentProfile: {
          name: student.name,
          email: student.email,
          phone: student.phone,
          course: student.course,
          address: student.address,
          city: student.city,
          state: student.state,
          pincode: student.pincode
        }
      });
    }

    res.json(resume);
  } catch (error) {
    console.error('getResume error:', error);
    res.status(500).json({ msg: 'Server error fetching resume' });
  }
};

// Save or Update resume
exports.saveResume = async (req, res) => {
  try {
    const studentId = req.user.id;
    const resumeData = req.body;

    // Get student to ensure we have the correct adminId for isolation
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student profile not found' });
    }

    const adminId = student.adminId;

    let resume = await Resume.findOne({ studentId });

    if (resume) {
      // Update existing
      resume = await Resume.findOneAndUpdate(
        { studentId },
        { ...resumeData, adminId },
        { new: true, runValidators: true }
      );
    } else {
      // Create new
      resume = new Resume({
        ...resumeData,
        studentId,
        adminId
      });
      await resume.save();
    }

    res.json({ msg: 'Resume saved successfully', resume });
  } catch (error) {
    console.error('saveResume error:', error);
    res.status(500).json({ msg: 'Server error saving resume' });
  }
};
