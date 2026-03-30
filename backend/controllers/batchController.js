const Batch = require('../models/Batch');

// Get all batches for an admin
exports.getBatches = async (req, res) => {
  try {
    const batches = await Batch.find({ adminId: req.user.id }).sort({ createdAt: -1 });
    res.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ msg: 'Error fetching batches', error: error.message });
  }
};

// Add a new batch
exports.addBatch = async (req, res) => {
  try {
    const { name, startTime, endTime, days } = req.body;

    // Check if batch already exists for this admin
    const existingBatch = await Batch.findOne({ name: name.trim(), adminId: req.user.id });
    if (existingBatch) {
      return res.status(400).json({ msg: 'Batch with this name already exists' });
    }

    const batch = new Batch({
      name: name.trim(),
      startTime,
      endTime,
      days: days || [],
      adminId: req.user.id
    });

    await batch.save();
    res.status(201).json({ msg: 'Batch added successfully', batch });
  } catch (error) {
    console.error('Error adding batch:', error);
    res.status(500).json({ msg: 'Error adding batch', error: error.message });
  }
};

// Update a batch
exports.updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startTime, endTime, days, isActive } = req.body;

    const batch = await Batch.findOneAndUpdate(
      { _id: id, adminId: req.user.id },
      { name: name.trim(), startTime, endTime, days, isActive },
      { new: true, runValidators: true }
    );

    if (!batch) {
      return res.status(404).json({ msg: 'Batch not found' });
    }

    res.json({ msg: 'Batch updated successfully', batch });
  } catch (error) {
    console.error('Error updating batch:', error);
    res.status(500).json({ msg: 'Error updating batch', error: error.message });
  }
};

// Delete a batch
exports.deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findOneAndDelete({ _id: id, adminId: req.user.id });

    if (!batch) {
      return res.status(404).json({ msg: 'Batch not found' });
    }

    res.json({ msg: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({ msg: 'Error deleting batch', error: error.message });
  }
};
