const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs');

// Get all staff for an admin
exports.getStaff = async (req, res) => {
  try {
    const defaultRole = req.query.role || null;
    const filter = { adminId: req.user.id };
    if (defaultRole) filter.role = defaultRole;

    const staffMembers = await Staff.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(staffMembers);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching staff', error: error.message });
  }
};

// Add new staff
exports.addStaff = async (req, res) => {
  try {
    const { name, email, phone, role, specialization, password, baseSalary } = req.body;

    const existingStaff = await Staff.findOne({ email: email.toLowerCase().trim() });
    if (existingStaff) {
      return res.status(400).json({ msg: 'Staff with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || "123456", salt);

    const staff = new Staff({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      role: role || 'Teacher',
      specialization: specialization || undefined,
      baseSalary: baseSalary || 0,
      password: hashedPassword,
      adminId: req.user.id
    });

    await staff.save();
    const { password: _, ...staffSafe } = staff.toObject();
    res.status(201).json({ msg: 'Staff added successfully', staff: staffSafe });
  } catch (error) {
    res.status(500).json({ msg: 'Error adding staff', error: error.message });
  }
};

// Update staff
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, role, specialization, isActive, baseSalary } = req.body;

    const staff = await Staff.findOneAndUpdate(
      { _id: id, adminId: req.user.id },
      { 
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(role && { role }),
        ...(specialization && { specialization }),
        ...(isActive !== undefined && { isActive }),
        ...(baseSalary !== undefined && { baseSalary }),
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!staff) return res.status(404).json({ msg: 'Staff not found' });
    res.json({ msg: 'Staff updated successfully', staff });
  } catch (error) {
    res.status(500).json({ msg: 'Error updating staff', error: error.message });
  }
};

// Delete staff
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findOneAndDelete({ _id: id, adminId: req.user.id });
    if (!staff) return res.status(404).json({ msg: 'Staff not found' });
    res.json({ msg: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Error deleting staff', error: error.message });
  }
};
