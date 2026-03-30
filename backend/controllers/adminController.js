const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTP } = require("../services/emailService");

// ⬇️ Import other models for dashboard stats
const Course = require("../models/Course");
const Student = require("../models/Student");
const Note = require("../models/Note");
const Attendance = require("../models/Attendance");
const Fee = require("../models/Fee");
const Enrollment = require("../models/Enrollment");
const FeeSchedule = require("../models/FeeSchedule");
const Payment = require("../models/Payment");

// ✅ Register Admin
exports.registerAdmin = async (req, res) => {
  const { name, instituteName, field, email, mobile, password } = req.body;
  try {
    let admin = await Admin.findOne({ email });
    if (admin) return res.status(400).json({ msg: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    admin = new Admin({ 
        name, 
        instituteName, 
        field, 
        email, 
        mobile, 
        password: hashedPassword,
        isTemporaryPassword: false // Manual registration usually means non-temp
    });
    await admin.save();

    res.status(201).json({ msg: "Admin registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ✅ Login Admin
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const token = jwt.sign(
      { id: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token, isTemporaryPassword: admin.isTemporaryPassword });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ✅ OTP Logic for Password Update
exports.requestOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 600000; // 10 mins

    const admin = await Admin.findOneAndUpdate(
      { email },
      { otp, otpExpires },
      { new: true, runValidators: false } // Bypassing validation for legacy accounts lacking required fields
    );

    if (!admin) return res.status(404).json({ msg: "Admin not found" });

    await sendOTP(email, otp);
    res.json({ msg: "OTP sent to email" });
  } catch (err) {
    console.error("OTP REQUEST ERROR:", err);
    res.status(500).send("Server Error");
  }
};

exports.updatePasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const admin = await Admin.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
    if (!admin) return res.status(400).json({ msg: "Invalid or expired OTP" });

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.isTemporaryPassword = false;
    admin.otp = undefined;
    admin.otpExpires = undefined;
    await admin.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ✅ Get Dashboard Stats
exports.getDashboardData = async (req, res) => {
  try {
    const [admin, courses, students, notes, attendance, fees] = await Promise.all([
      Admin.findById(req.user.id).select("plan planExpiryDate isActive instituteName"),
      Course.countDocuments({ adminId: req.user.id }),
      Student.countDocuments({ adminId: req.user.id }),
      Note.countDocuments({ adminId: req.user.id }),
      Attendance.countDocuments({ adminId: req.user.id }),
      Fee.countDocuments({ adminId: req.user.id }),
    ]);

    res.json({
      subscription: admin,
      courses,
      students,
      notes,
      attendance,
      fees
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ✅ Get Admin Profile
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password -otp -otpExpires");
    if (!admin) return res.status(404).json({ msg: "Admin not found" });
    res.json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ✅ Update Admin Profile
exports.updateAdminProfile = async (req, res) => {
  const { name, instituteName, mobile, field } = req.body;
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.user.id,
      { $set: { name, instituteName, mobile, field } },
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpires");
    
    res.json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// @route   POST /api/admin/fix-data
// @desc    Associate all orphan records with the current admin
exports.fixDataOrphans = async (req, res) => {
  try {
    const adminId = req.user.id;
    const filter = { adminId: { $exists: false } };
    const filterAlt = { adminId: null };

    const results = await Promise.all([
      Student.updateMany({ $or: [filter, filterAlt] }, { $set: { adminId } }),
      Fee.updateMany({ $or: [filter, filterAlt] }, { $set: { adminId } }),
      Course.updateMany({ $or: [filter, filterAlt] }, { $set: { adminId } }),
      Enrollment.updateMany({ $or: [filter, filterAlt] }, { $set: { adminId } }),
      FeeSchedule.updateMany({ $or: [filter, filterAlt] }, { $set: { adminId } }),
      Payment.updateMany({ $or: [filter, filterAlt] }, { $set: { adminId } }),
    ]);

    res.json({
      message: 'Migration successful',
      counts: {
        students: results[0].modifiedCount,
        fees: results[1].modifiedCount,
        courses: results[2].modifiedCount,
        enrollments: results[3].modifiedCount,
        schedules: results[4].modifiedCount,
        payments: results[5].modifiedCount,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Migration failed' });
  }
};
