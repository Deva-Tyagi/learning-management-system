const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');

// Middleware to verify student token
const studentAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ msg: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.user.type !== 'student') {
      return res.status(401).json({ msg: 'Access denied. Students only.' });
    }

    req.user = decoded.user;
    // console.log('Auth successful for:', req.user.email, 'Admin:', req.user.adminId); // Debug
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ msg: 'Invalid token' });
  }
};

// Get available exams for student (FIXED VERSION)
router.get('/available', studentAuth, async (req, res) => {
  try {
    const { course, batch } = req.user;
    const now = new Date();
    
    // console.log('Student details:', { course, batch, userId: req.user.id }); // Debug

    // Get all exams for student's course and batch or individually assigned
    const exams = await Exam.find({
      course,
      $or: [
        { batch }, // Batch-wide
        { assignedStudents: req.user.id } // Specifically assigned
      ],
      isActive: true
    }).sort({ examDate: 1, startTime: 1 });

    // console.log('Found exams:', exams.length); // Debug
    // console.log('Exam details:', exams.map(e => ({ 
    //   title: e.title, 
    //   course: e.course, 
    //   batch: e.batch, 
    //   date: e.examDate,
    //   isActive: e.isActive 
    // }))); // Debug

    // Check which exams student has already taken
    const examResults = await ExamResult.find({ 
      studentId: req.user.id,
      status: 'submitted'
    }).select('examId');
    
    const takenExamIds = examResults.map(result => result.examId.toString());
    // console.log('Taken exam IDs:', takenExamIds); // Debug

    const availableExams = exams.map(exam => {
      const examDateTime = new Date(exam.examDate);
      const currentDate = new Date();
      
      // Check if exam is today or in the future
      const isAvailable = examDateTime >= currentDate.setHours(0, 0, 0, 0) || 
                         examDateTime.toDateString() === currentDate.toDateString();
      
      return {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        course: exam.course,
        batch: exam.batch,
        examDate: exam.examDate,
        startTime: exam.startTime,
        endTime: exam.endTime,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        questionCount: exam.questions ? exam.questions.length : 0,
        instructions: exam.instructions || [],
        isAlreadyTaken: takenExamIds.includes(exam._id.toString()),
        canStart: isExamStartable(exam, now) && !takenExamIds.includes(exam._id.toString()),
        isAvailable: isAvailable,
        createdAt: exam.createdAt || exam.examDate
      };
    });

    // console.log('Available exams to return:', availableExams.length); // Debug
    res.json(availableExams);
  } catch (error) {
    console.error('Error fetching available exams:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get exam for taking (with questions)
router.get('/:examId/start', studentAuth, async (req, res) => {
  try {
    const { examId } = req.params;
    const now = new Date();

    // Check if exam exists and is active
    const exam = await Exam.findById(examId);
    if (!exam || !exam.isActive) {
      return res.status(404).json({ msg: 'Exam not found or inactive' });
    }

    // Check if exam belongs to student (either via batch or individual assignment)
    const isAssigned = exam.assignedStudents && exam.assignedStudents.includes(req.user.id);
    const isBatchMatch = exam.batch === req.user.batch && exam.course === req.user.course;

    if (!isAssigned && !isBatchMatch) {
      return res.status(403).json({ msg: 'You are not enrolled in this exam' });
    }

    // Check if exam is startable
    if (!isExamStartable(exam, now)) {
      return res.status(400).json({ msg: 'Exam is not available at this time' });
    }

    // Check if student has already taken this exam
    let examResult = await ExamResult.findOne({
      examId,
      studentId: req.user.id
    });

    if (examResult) {
      if (examResult.status === 'submitted') {
        return res.status(400).json({ msg: 'You have already completed this exam' });
      }
      // If status is 'started', we just return the existing session
    }

    // Prepare exam data for student (without correct answers)
    const examForStudent = {
      _id: exam._id,
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      instructions: exam.instructions,
      questions: exam.questions.map((q, index) => ({
        _id: q._id,
        questionNumber: index + 1,
        question: q.question,
        type: q.type,
        options: q.type === 'mcq' ? q.options : undefined,
        marks: q.marks
      }))
    };

    if (!examResult) {
      // Create initial exam result with "started" status
      examResult = new ExamResult({
        examId,
        studentId: req.user.id,
        answers: [],
        totalMarks: exam.totalMarks,
        status: 'started',
        startTime: now,
        adminId: req.user.adminId // Get from student token
      });
      await examResult.save();
    }

    res.json({
      exam: examForStudent,
      resultId: examResult._id,
      startTime: examResult.startTime || now
    });
  } catch (error) {
    console.error('Error starting exam:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Submit exam
router.post('/:examId/submit', studentAuth, async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers, timeTaken } = req.body;

    // Find the exam result
    const examResult = await ExamResult.findOne({
      examId,
      studentId: req.user.id,
      status: 'started'
    });

    if (!examResult) {
      return res.status(400).json({ msg: 'No active exam session found' });
    }

    // Get exam details
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }

    // Process answers and calculate marks
    let totalMarksObtained = 0;
    const processedAnswers = answers.map(answer => {
      const question = exam.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) return answer;

      let isCorrect = false;
      let marksObtained = 0;

      if (question.type === 'mcq') {
        isCorrect = question.correctAnswer === answer.answer;
        marksObtained = isCorrect ? question.marks : 0;
      }
      // For descriptive questions, marks will be assigned during manual grading

      totalMarksObtained += marksObtained;

      return {
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect,
        marksObtained,
        timeTaken: answer.timeTaken || 0
      };
    });

    const percentage = (totalMarksObtained / exam.totalMarks * 100).toFixed(2);
    const isPassed = totalMarksObtained >= exam.passingMarks;

    // Update exam result
    examResult.answers = processedAnswers;
    examResult.marksObtained = totalMarksObtained;
    examResult.percentage = parseFloat(percentage);
    examResult.isPassed = isPassed;
    examResult.status = 'submitted';
    examResult.submitTime = new Date();
    examResult.timeTaken = timeTaken;

    await examResult.save();

    // Return result based on exam settings
    const resultData = {
      submitted: true,
      examTitle: exam.title,
      timeTaken
    };

    if (exam.showResultsImmediately) {
      resultData.result = {
        marksObtained: totalMarksObtained,
        totalMarks: exam.totalMarks,
        percentage: parseFloat(percentage),
        grade: examResult.grade,
        isPassed
      };
    }

    res.json(resultData);
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get student's exam results
router.get('/my-results', studentAuth, async (req, res) => {
  try {
    const results = await ExamResult.find({
      studentId: req.user.id,
      status: 'submitted'
    })
    .populate('examId', 'title course examDate totalMarks')
    .sort({ submitTime: -1 });

    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Helper function to check if exam can be started
function isExamStartable(exam, currentTime) {
  if (!exam.examDate || !exam.startTime || !exam.endTime) return false;
  
  const examDate = new Date(exam.examDate);
  const [startHour, startMin] = exam.startTime.split(':');
  const [endHour, endMin] = exam.endTime.split(':');
  
  const examStartTime = new Date(examDate);
  examStartTime.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
  
  const examEndTime = new Date(examDate);
  examEndTime.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

  // Allow starting if current time is within exam window
  return currentTime >= examStartTime && currentTime <= examEndTime;
}

// Get detailed exam result
router.get('/result/:resultId', studentAuth, async (req, res) => {
  try {
    const { resultId } = req.params;
    const result = await ExamResult.findOne({
      _id: resultId,
      studentId: req.user.id
    }).populate('examId');

    if (!result) {
      return res.status(404).json({ msg: 'Result not found' });
    }

    const exam = result.examId;
    if (!exam) return res.status(404).json({ msg: 'Original exam data not found' });

    // Combine result.answers with exam.questions to provide full context
    const detailedAnswers = result.answers.map(ans => {
      const question = exam.questions.find(q => q._id.toString() === ans.questionId.toString());
      return {
        ...ans.toObject(),
        questionText: question ? question.question : 'Question removed',
        type: question ? question.type : 'unknown',
        options: question ? question.options : [],
        correctAnswer: question ? question.correctAnswer : null
      };
    });

    res.json({
      ...result.toObject(),
      detailedAnswers,
      exam: {
        title: exam.title,
        course: exam.course,
        examDate: exam.examDate,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks
      }
    });
  } catch (error) {
    console.error('Error fetching detailed result:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
