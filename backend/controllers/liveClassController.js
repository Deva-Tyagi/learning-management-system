const LiveClass = require('../models/LiveClass');

// @route   POST /api/live-classes
// @desc    Create a new live class
// @access  Private (Admin)
exports.createLiveClass = async (req, res) => {
  try {
    const { title, description, batch, date, time, duration, meetingLink, platform } = req.body;
    
    if (!title || !batch || !date || !time || !duration || !meetingLink) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    const liveClass = new LiveClass({
      title,
      description,
      batch,
      instructor: req.user.id, // from authMiddleware
      date,
      time,
      duration,
      meetingLink,
      platform: platform || 'Zoom',
      adminId: req.user.id
    });

    await liveClass.save();
    res.status(201).json({ msg: 'Live class scheduled successfully', liveClass });
  } catch (err) {
    console.error('Error creating live class:', err);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
};

// @route   GET /api/live-classes
// @desc    Get all live classes (Admin)
// @access  Private (Admin)
exports.getLiveClasses = async (req, res) => {
  try {
    const query = { adminId: req.user.id };
    if (req.query.batch) {
      query.batch = req.query.batch;
    }
    const classes = await LiveClass.find(query)
      .populate('instructor', 'name email')
      .sort({ date: 1, time: 1 });
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/live-classes/student
// @desc    Get live classes for a specific student's batch
// @access  Private (Student)
exports.getStudentLiveClasses = async (req, res) => {
  try {
    const { batch, course } = req.query;
    if (!batch && !course) {
      return res.status(400).json({ msg: 'Batch or Course parameter is required' });
    }

    const Student = require('../models/Student');
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    const query = {
      adminId: student.adminId,
      $or: [
        { batch: batch },
        { batch: course },
        { batch: `${course} (${batch})` },
        { batch: new RegExp(batch, 'i') },
        { batch: new RegExp(course, 'i') }
      ]
    };

    const classes = await LiveClass.find(query)
      .populate('instructor', 'name')
      .sort({ date: 1, time: 1 });
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/live-classes/:id
// @desc    Update a live class
// @access  Private (Admin)
exports.updateLiveClass = async (req, res) => {
  try {
    let liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ msg: 'Live class not found' });
    }

    liveClass = await LiveClass.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    res.json({ msg: 'Live class updated successfully', liveClass });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE /api/live-classes/:id
// @desc    Delete a live class
// @access  Private (Admin)
exports.deleteLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findOneAndDelete({ _id: req.params.id, adminId: req.user.id });
    res.json({ msg: 'Live class deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
