const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getPresignedUrl } = require('../config/s3');

/** Next REG-{year}-{#####} for this admin; skips taken numbers and respects manual values if unique. */
async function ensureUniqueRegistrationNo(adminId, preferred) {
  const year = new Date().getFullYear();
  const pref = (preferred || '').trim();
  if (pref) {
    const clash = await Student.findOne({ adminId, registrationNo: pref });
    if (!clash) return pref;
  }
  let n = (await Student.countDocuments({ adminId })) + 1;
  for (let i = 0; i < 10000; i++) {
    const candidate = `REG-${year}-${String(n).padStart(5, '0')}`;
    const exists = await Student.findOne({ adminId, registrationNo: candidate });
    if (!exists) return candidate;
    n++;
  }
  return `REG-${year}-${Date.now().toString(36).toUpperCase()}`;
}

exports.previewRegistrationNumber = async (req, res) => {
  try {
    const registrationNo = await ensureUniqueRegistrationNo(req.user.id, '');
    res.json({ registrationNo });
  } catch (error) {
    console.error('previewRegistrationNumber:', error);
    res.status(500).json({ msg: 'Could not generate registration number', error: error.message });
  }
};

// STUDENT LOGIN CONTROLLER (ADD THIS AT THE TOP OF THE FILE)
exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // ⬇️ Store correct "_id" in token as "id"
    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Remove password before sending
    const { password: _pw, ...studentSafe } = student.toObject();

    res.json({
      token,
      student: studentSafe
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ msg: 'Login failed', error: error.message });
  }
};

// Get all students (updated to exclude password and filter by adminId)
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({ adminId: req.user.id }).select('-password').sort({ createdAt: -1 });
    
    // Sign URLs for S3 files
    const signedStudents = await Promise.all(students.map(async (student) => {
      const s = student.toObject();
      s._id = student._id?.toString(); // Ensure string ID
      if (s.photo) s.photo = await getPresignedUrl(s.photo);
      if (s.document) s.document = await getPresignedUrl(s.document);
      if (s.signature) s.signature = await getPresignedUrl(s.signature);
      return s;
    }));

    console.log(`[DEBUG] getStudents: Returning ${signedStudents.length} students. Example ID: ${signedStudents[0]?._id}`);
    res.json(signedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ msg: 'Error fetching students', error: error.message });
  }
};

// Add student (updated to handle password hashing)
exports.addStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      franchise,
      registrationNo,
      course,
      batch,
      rollNumber,
      admissionDate,
      dob,
      gender,
      religion,
      caste,
      bloodGroup,
      address,
      state,
      district,
      city,
      pincode,
      referralCode,
      username,
      feesPaid,
      totalFees,
      fatherName,
      motherName,
      guardianPhone,
      guardianAddress,
      status
    } = req.body;

    // ✅ Quota Enforcement Check
    const GlobalSetting = require('../models/GlobalSetting');
    const Admin = require('../models/Admin');
    const settings = await GlobalSetting.findOne();
    const admin = await Admin.findById(req.user.id);

    if (settings && admin) {
        const studentCount = await Student.countDocuments({ adminId: req.user.id });
        const plan = admin.plan?.toLowerCase() || 'basic'; // basic, premium, enterprise
        const limitKey = plan === 'basic' ? 'basicStudentLimit' : plan === 'premium' || plan === 'professional' ? 'professionalStudentLimit' : 'enterpriseStudentLimit'; // Enterprise usually has no limit or high
        
        // Actually, let's use the keys from schema: basicStudentLimit, professionalStudentLimit
        const limit = settings.quotas?.[plan + 'StudentLimit'] || settings.quotas?.[limitKey] || 10000;
        
        if (studentCount >= limit) {
          return res.status(403).json({ 
            msg: `Enrollment limit reached for your ${admin.plan} plan (${limit} students). Please upgrade to add more.`,
            limit 
          });
        }
    }

    // Validate required fields
    if (!name || !email || !phone || !course) {
      return res.status(400).json({ msg: 'Required fields are missing' });
    }

    const normalizedEmail = (email || '').toLowerCase().trim();

    // Check if student already exists
    const existingStudent = await Student.findOne({ email: normalizedEmail });
    if (existingStudent) {
      return res.status(400).json({ msg: 'Student with this email already exists' });
    }

    const photo = req.files?.photo?.[0] ? req.files.photo[0].location : '';
    const documentPath = req.files?.document?.[0] ? req.files.document[0].location : (req.body.documentPath || '');
    const signaturePath = req.files?.signature?.[0] ? req.files.signature[0].location : (req.body.signaturePath || '');

    // Set default password if not provided
    const studentPassword = password || 'student123';

    const resolvedRegistrationNo = await ensureUniqueRegistrationNo(req.user.id, registrationNo);

    const student = new Student({
      name: name.trim(),
      email: normalizedEmail,
      password: studentPassword, // Hashed by pre-save hook
      phone,
      franchise: franchise || '',
      registrationNo: resolvedRegistrationNo,
      course,
      batch: batch || '',
      rollNumber: rollNumber || '',
      admissionDate: admissionDate ? new Date(admissionDate) : Date.now(),
      dob: dob ? new Date(dob) : null,
      gender: gender || '',
      religion: religion || '',
      caste: caste || '',
      bloodGroup: bloodGroup || '',
      address: address || '',
      state: state || '',
      district: district || '',
      city: city || '',
      pincode: pincode || '',
      referralCode: referralCode || '',
      username: username || '',
      photo,
      document: documentPath,
      signature: signaturePath,
      fatherName: fatherName || '',
      motherName: motherName || '',
      guardianPhone: guardianPhone || '',
      guardianAddress: guardianAddress || '',
      status: status || 'Active',
      feesPaid: feesPaid || 0,
      totalFees: totalFees || 0,
      isActive: status === 'Active',
      firstLogin: true,
      adminId: req.user.id
    });

    await student.save(); // Password gets hashed

    // Remove password from response
    const s = student.toObject();
    s._id = student._id?.toString();
    delete s.password;
    if (s.photo) s.photo = await getPresignedUrl(s.photo);
    if (s.document) s.document = await getPresignedUrl(s.document);
    if (s.signature) s.signature = await getPresignedUrl(s.signature);

    res.status(201).json({ 
      msg: 'Student added successfully', 
      student: s 
    });
  } catch (error) {
    console.error('Error adding student:', error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: 'Email already exists' });
    }
    res.status(500).json({ msg: 'Error adding student', error: error.message });
  }
};

// Update student (handle password separately)
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[DEBUG] Update Student requested for ID: ${id}`);
    if (!id || id === 'undefined') {
      console.error(`[ERROR] updateStudent: Invalid ID received: ${id}`);
      return res.status(400).json({ msg: 'Invalid Student ID provided' });
    }
    const updateData = { ...req.body };

    // Remove password from update data - use separate endpoint for password changes
    delete updateData.password;

    // Handle dates properly if present
    if (updateData.admissionDate) updateData.admissionDate = new Date(updateData.admissionDate);
    if (updateData.dob) updateData.dob = new Date(updateData.dob);

    if (req.files?.photo?.[0]) {
      updateData.photo = req.files.photo[0].location;
    }
    if (req.files?.document?.[0]) {
      updateData.document = req.files.document[0].location;
    }
    if (req.files?.signature?.[0]) {
      updateData.signature = req.files.signature[0].location;
    }

    if (updateData.documentPath) {
      updateData.document = updateData.documentPath;
      delete updateData.documentPath;
    }

    if (updateData.signaturePath) {
      updateData.signature = updateData.signaturePath;
      delete updateData.signaturePath;
    }

    if (updateData.status) {
      updateData.isActive = updateData.status === 'Active';
    }

    const student = await Student.findOneAndUpdate(
      { _id: id, adminId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    const s = student.toObject();
    s._id = student._id?.toString();
    if (s.photo) s.photo = await getPresignedUrl(s.photo);
    if (s.document) s.document = await getPresignedUrl(s.document);
    if (s.signature) s.signature = await getPresignedUrl(s.signature);

    console.log(`[DEBUG] updateStudent: Sending response for student: ${s._id}`);
    res.json({ msg: 'Student updated successfully', student: s });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ msg: 'Error updating student', error: error.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOneAndDelete({ _id: id, adminId: req.user.id });
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }
    res.json({ msg: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ msg: 'Error deleting student', error: error.message });
  }
};

// Reset student password (admin function)
exports.resetStudentPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const student = await Student.findOne({ _id: id, adminId: req.user.id });
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Set new password (will be hashed by pre-save hook)
    student.password = newPassword || 'student123';
    student.firstLogin = true;
    await student.save();

    res.json({ msg: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ msg: 'Error resetting password', error: error.message });
  }
};
