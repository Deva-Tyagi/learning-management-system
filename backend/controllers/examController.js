const Exam = require('../models/Exam');
const Student = require('../models/Student');

// Create new exam
exports.createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      course,
      batch,
      examDate,
      startTime,
      endTime,
      duration,
      totalMarks,
      passingMarks,
      questions,
      instructions,
      allowLateSubmission,
      showResultsImmediately,
      randomizeQuestions,
      assignedStudents
    } = req.body;

    // Validate required fields
    if (!title || !course || !examDate || !startTime || !endTime || !duration) {
      return res.status(400).json({ msg: 'All required fields must be filled' });
    }

    if (!batch && (!assignedStudents || assignedStudents.length === 0)) {
      return res.status(400).json({ msg: 'Please provide either a batch or specific students' });
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({ msg: 'At least one question is required' });
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question || !question.marks) {
        return res.status(400).json({ msg: `Question ${i + 1} is incomplete` });
      }
      
      if (question.type === 'mcq') {
        if (!question.options || question.options.length < 2) {
          return res.status(400).json({ msg: `Question ${i + 1} must have at least 2 options` });
        }
        if (!question.correctAnswer && question.correctAnswer !== '0') {
          return res.status(400).json({ msg: `Question ${i + 1} must have a correct answer selected` });
        }
      }
    }

    // Check for overlapping exams
    const existingExam = await Exam.findOne({
      course,
      batch,
      examDate: new Date(examDate),
      isActive: true,
      adminId: req.user.id,
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gte: startTime }
        },
        {
          startTime: { $lte: endTime },
          endTime: { $gte: endTime }
        }
      ]
    });

    if (existingExam) {
      return res.status(400).json({ 
        msg: 'Another exam is already scheduled for this batch at the same time' 
      });
    }

    const exam = new Exam({
      title,
      description,
      course,
      batch,
      examDate: new Date(examDate),
      startTime,
      endTime,
      duration,
      totalMarks,
      passingMarks,
      questions: questions.map((q, index) => ({
        ...q,
        order: index + 1
      })),
      instructions: instructions || [],
      allowLateSubmission: allowLateSubmission || false,
      showResultsImmediately: showResultsImmediately || false,
      randomizeQuestions: randomizeQuestions || false,
      assignedStudents: assignedStudents || [],
      createdBy: req.user.id,
      adminId: req.user.id
    });

    await exam.save();

    res.status(201).json({
      msg: 'Exam created successfully',
      exam: {
        _id: exam._id,
        title: exam.title,
        course: exam.course,
        batch: exam.batch,
        examDate: exam.examDate,
        totalMarks: exam.totalMarks
      }
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ 
      msg: 'Error creating exam', 
      error: error.message 
    });
  }
};

// Get all exams
exports.getExams = async (req, res) => {
  try {
    const { course, batch, isActive } = req.query;
    
    let query = {};
    
    if (course) query.course = course;
    if (batch) query.batch = batch;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    query.adminId = req.user.id; // Enforce isolation

    const exams = await Exam.find(query)
      .sort({ examDate: -1, createdAt: -1 })
      .select('title description course batch examDate startTime endTime duration totalMarks passingMarks isActive createdAt');

    res.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ 
      msg: 'Error fetching exams', 
      error: error.message 
    });
  }
};

// Get exam by ID
exports.getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findOne({ _id: id, adminId: req.user.id });
    
    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ 
      msg: 'Error fetching exam', 
      error: error.message 
    });
  }
};

// Get exams by batch and course
exports.getExamsByBatch = async (req, res) => {
  try {
    const { batch, course } = req.params;
    const { isActive = true } = req.query;

    const exams = await Exam.find({
      batch,
      course,
      isActive,
      adminId: req.user.id
    }).sort({ examDate: -1 });

    res.json(exams);
  } catch (error) {
    console.error('Error fetching exams by batch:', error);
    res.status(500).json({ 
      msg: 'Error fetching exams', 
      error: error.message 
    });
  }
};

// Update exam
exports.updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate questions if provided
    if (updateData.questions) {
      for (let i = 0; i < updateData.questions.length; i++) {
        const question = updateData.questions[i];
        if (!question.question || !question.marks) {
          return res.status(400).json({ msg: `Question ${i + 1} is incomplete` });
        }
      }
    }

    const exam = await Exam.findOneAndUpdate(
      { _id: id, adminId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }

    res.json({
      msg: 'Exam updated successfully',
      exam
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ 
      msg: 'Error updating exam', 
      error: error.message 
    });
  }
};

// Delete exam
exports.deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findOneAndDelete({ _id: id, adminId: req.user.id });

    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }

    res.json({ msg: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ 
      msg: 'Error deleting exam', 
      error: error.message 
    });
  }
};

// Activate/Deactivate exam
exports.activateDeactivateExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findOne({ _id: id, adminId: req.user.id });

    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }

    exam.isActive = !exam.isActive;
    await exam.save();

    res.json({
      msg: `Exam ${exam.isActive ? 'activated' : 'deactivated'} successfully`,
      exam: {
        _id: exam._id,
        title: exam.title,
        isActive: exam.isActive
      }
    });
  } catch (error) {
    console.error('Error toggling exam status:', error);
    res.status(500).json({ 
      msg: 'Error updating exam status', 
      error: error.message 
    });
  }
};
