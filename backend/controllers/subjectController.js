// controllers/subjectController.js
const Subject = require('../models/Subject');

// GET all subjects for this admin
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ adminId: req.user.id }).sort({ category: 1, name: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching subjects', error: err.message });
  }
};

// POST add subject
exports.addSubject = async (req, res) => {
  try {
    const { name, code, category } = req.body;
    if (!name?.trim()) return res.status(400).json({ msg: 'Subject name is required' });
    if (!code?.trim()) return res.status(400).json({ msg: 'Subject code is required' });

    const existing = await Subject.findOne({
      $or: [
        { name: name.trim(), adminId: req.user.id },
        { code: code.trim().toUpperCase(), adminId: req.user.id },
      ],
    });
    if (existing) return res.status(400).json({ msg: 'A subject with this name or code already exists' });

    const subject = await Subject.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      category: category || 'computerCourses',
      adminId: req.user.id,
    });
    res.status(201).json({ msg: 'Subject added successfully', subject });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ msg: 'Subject name or code already exists' });
    res.status(500).json({ msg: 'Error adding subject', error: err.message });
  }
};

// PUT update subject
exports.updateSubject = async (req, res) => {
  try {
    const { name, code, category } = req.body;
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user.id },
      {
        ...(name  && { name: name.trim() }),
        ...(code  && { code: code.trim().toUpperCase() }),
        ...(category && { category }),
      },
      { new: true, runValidators: true }
    );
    if (!subject) return res.status(404).json({ msg: 'Subject not found' });
    res.json({ msg: 'Subject updated successfully', subject });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ msg: 'Subject name or code already exists' });
    res.status(500).json({ msg: 'Error updating subject', error: err.message });
  }
};

// DELETE subject
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, adminId: req.user.id });
    if (!subject) return res.status(404).json({ msg: 'Subject not found' });
    res.json({ msg: 'Subject deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Error deleting subject', error: err.message });
  }
};
