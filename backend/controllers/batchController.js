const Batch = require('../models/Batch');
const Student = require('../models/Student');

// Get all batches for an admin (with populated course, inCharge, and virtual currentEnrollment)
exports.getBatches = async (req, res) => {
  try {
    const batches = await Batch.find({ adminId: req.user.id })
      .populate('course', 'name category')
      .populate('inCharge', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate current enrollment for each batch
    for (let b of batches) {
      b.currentEnrollment = await Student.countDocuments({ 
        adminId: req.user.id, 
        batch: b.name, 
        status: 'Active' 
      });
    }

    res.json(batches);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching batches', error: error.message });
  }
};

// Add a new batch
exports.addBatch = async (req, res) => {
  try {
    const { name, course, inCharge, startTime, endTime, scheduleDays, capacity, status } = req.body;

    const existingBatch = await Batch.findOne({ name: name.trim(), adminId: req.user.id });
    if (existingBatch) return res.status(400).json({ msg: 'Batch with this name already exists' });

    const batch = new Batch({
      name: name.trim(),
      course,
      inCharge: inCharge || undefined,
      startTime,
      endTime,
      scheduleDays: scheduleDays || [],
      capacity: capacity || 50,
      status: status || 'Active',
      adminId: req.user.id
    });

    await batch.save();
    res.status(201).json({ msg: 'Batch added successfully', batch });
  } catch (error) {
    res.status(500).json({ msg: 'Error adding batch', error: error.message });
  }
};

// Update a batch
exports.updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, course, inCharge, startTime, endTime, scheduleDays, capacity, status } = req.body;

    // Check if renaming causes collision
    if (name) {
      const existing = await Batch.findOne({ name: name.trim(), adminId: req.user.id, _id: { $ne: id } });
      if (existing) return res.status(400).json({ msg: 'Batch with this name already exists' });
    }

    const batch = await Batch.findOneAndUpdate(
      { _id: id, adminId: req.user.id },
      { 
        ...(name && { name: name.trim() }),
        ...(course && { course }),
        ...(inCharge !== undefined && { inCharge }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(scheduleDays && { scheduleDays }),
        ...(capacity !== undefined && { capacity }),
        ...(status && { status }),
      },
      { new: true, runValidators: true }
    );

    if (!batch) return res.status(404).json({ msg: 'Batch not found' });
    res.json({ msg: 'Batch updated successfully', batch });
  } catch (error) {
    res.status(500).json({ msg: 'Error updating batch', error: error.message });
  }
};

// Delete a batch
exports.deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findOneAndDelete({ _id: id, adminId: req.user.id });
    if (!batch) return res.status(404).json({ msg: 'Batch not found' });
    res.json({ msg: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Error deleting batch', error: error.message });
  }
};
