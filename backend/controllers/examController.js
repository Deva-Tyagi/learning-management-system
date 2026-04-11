const Exam = require('../models/Exam');
const Student = require('../models/Student');
const Question = require('../models/Question');

// Create new exam
exports.createExam = async (req, res) => {
  try {
    const {
      title, description, course, batch, targetType, assignedStudents,
      examDate, startTime, endTime, duration, totalMarks, passingPercentage,
      totalExamMarks, questionGroupId, instructions, allowLateSubmission,
      showResultsImmediately, randomizeQuestions, automaticSerialization,
      questions: bodyQuestions, manualQuestions
    } = req.body;

    const sourceQuestions = bodyQuestions || manualQuestions || [];
    const targetMarks = totalExamMarks || totalMarks;

    if (!title || !course || !examDate || !startTime || !endTime || !duration || !targetMarks) {
      return res.status(400).json({ msg: 'All required fields must be filled' });
    }

    let finalAssignedStudents = [];
    if (batch && (!assignedStudents || assignedStudents.length === 0)) {
      const studentsInBatch = await Student.find({ batch, isActive: true, adminId: req.user.id }).select('_id');
      finalAssignedStudents = studentsInBatch.map(s => s._id);
    } else {
      finalAssignedStudents = assignedStudents || [];
    }

    let finalQuestions = [];
    let calculatedTotalMarks = 0;

    if (questionGroupId && sourceQuestions.length === 0) {
      // Auto-fetch from group if not provided
      const questionsInGroup = await Question.find({ groupId: questionGroupId, adminId: req.user.id });
      if (questionsInGroup.length === 0) return res.status(400).json({ msg: 'No questions in group' });
      
      const shuffled = questionsInGroup.sort(() => 0.5 - Math.random());
      for (const q of shuffled) {
        if (calculatedTotalMarks < targetMarks) {
          finalQuestions.push({
            type: q.type, question: q.question, options: q.options,
            correctAnswer: q.correctAnswer, marks: q.marks, order: finalQuestions.length + 1
          });
          calculatedTotalMarks += q.marks;
        } else break;
      }
    } else if (sourceQuestions.length > 0) {
      // Logic for picking from provided pool to match totalExamMarks
      if (totalExamMarks > 0) {
        const shuffled = [...sourceQuestions].sort(() => 0.5 - Math.random());
        for (const q of shuffled) {
          if (calculatedTotalMarks < totalExamMarks) {
            finalQuestions.push({ ...q, order: finalQuestions.length + 1 });
            calculatedTotalMarks += q.marks;
          } else break;
        }
      } else {
        finalQuestions = sourceQuestions.map((q, index) => ({ ...q, order: index + 1 }));
        calculatedTotalMarks = finalQuestions.reduce((sum, q) => sum + q.marks, 0);
      }
    } else {
      return res.status(400).json({ msg: 'Select question source' });
    }

    const threshold = passingPercentage || 40;
    const passingMarks = Math.ceil((calculatedTotalMarks * threshold) / 100);

    const exam = new Exam({
      title, description, course, batch,
      assignedStudents: finalAssignedStudents,
      examDate: new Date(examDate), startTime, endTime, duration,
      totalMarks: calculatedTotalMarks,
      passingMarks,
      instructions: instructions || [],
      allowLateSubmission: allowLateSubmission || false,
      showResultsImmediately: showResultsImmediately || false,
      randomizeQuestions: randomizeQuestions || false,
      automaticSerialization: automaticSerialization !== undefined ? automaticSerialization : true,
      createdBy: req.user.id,
      adminId: req.user.id
    });

    await exam.save();

    // Auto-generate Admit Cards
    try {
      const AdmitCard = require('../models/AdmitCard');
      if (finalAssignedStudents.length > 0) {
        const admitCards = finalAssignedStudents.map(studentId => ({
          studentId, 
          examId: exam._id, 
          course, 
          adminId: req.user.id, 
          generatedBy: req.user.id,
          serialNumber: `ADC-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`
        }));
        await AdmitCard.insertMany(admitCards);
      }
    } catch (admitErr) { console.error('Admit card generation failed:', admitErr); }

    res.status(201).json({ msg: 'Exam scheduled and Admit Cards generated', examId: exam._id });
  } catch (error) {
    res.status(500).json({ msg: 'Error creating exam', error: error.message });
  }
};

// Get all exams
exports.getExams = async (req, res) => {
  try {
    const { course, batch } = req.query;
    let query = { adminId: req.user.id };
    if (course) query.course = course;
    if (batch) query.batch = batch;
    const exams = await Exam.find(query).sort({ examDate: -1 });
    const now = new Date();
    const filteredExams = exams.map(exam => {
      const examStart = new Date(exam.examDate);
      return { ...exam.toObject(), status: examStart < now ? 'Completed' : 'Upcoming' };
    });
    res.json(filteredExams);
  } catch (error) { res.status(500).json({ msg: 'Error' }); }
};

// Get exam by ID
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, adminId: req.user.id });
    if (!exam) return res.status(404).json({ msg: 'Not found' });
    res.json(exam);
  } catch (error) { res.status(500).json({ msg: 'Error' }); }
};

// Get exams by batch and course
exports.getExamsByBatch = async (req, res) => {
  try {
    const { batch, course } = req.params;
    const exams = await Exam.find({ batch, course, adminId: req.user.id }).sort({ examDate: -1 });
    res.json(exams);
  } catch (error) { res.status(500).json({ msg: 'Error' }); }
};

// Update/Delete (standard)
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user.id },
      req.body, { new: true }
    );
    res.json({ msg: 'Exam updated', exam });
  } catch (error) { res.status(500).json({ msg: 'Error' }); }
};

exports.deleteExam = async (req, res) => {
  try {
    await Exam.findOneAndDelete({ _id: req.params.id, adminId: req.user.id });
    res.json({ msg: 'Exam deleted' });
  } catch (error) { res.status(500).json({ msg: 'Error' }); }
};

// Toggle status
exports.activateDeactivateExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, adminId: req.user.id });
    if (!exam) return res.status(404).json({ msg: 'Not found' });
    exam.isActive = !exam.isActive;
    await exam.save();
    res.json({ msg: `Exam ${exam.isActive ? 'activated' : 'deactivated'}`, exam });
  } catch (error) { res.status(500).json({ msg: 'Error' }); }
};
