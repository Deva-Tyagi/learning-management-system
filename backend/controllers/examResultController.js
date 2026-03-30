const ExamResult = require('../models/ExamResult');
const Exam = require('../models/Exam');
const Student = require('../models/Student');

// Submit exam result
exports.submitExamResult = async (req, res) => {
  try {
    const { examId, answers, timeTaken } = req.body;
    const studentId = req.user.id; // Assuming student authentication

    // Validate exam exists and is active
    const exam = await Exam.findById(examId);
    if (!exam || !exam.isActive) {
      return res.status(404).json({ msg: 'Exam not found or inactive' });
    }

    // Check if student already submitted
    const existingResult = await ExamResult.findOne({ examId, studentId });
    if (existingResult) {
      return res.status(400).json({ msg: 'Exam already submitted' });
    }

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Calculate marks for MCQ questions
    let totalMarksObtained = 0;
    const processedAnswers = answers.map((answer, index) => {
      const question = exam.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) return answer;

      let isCorrect = false;
      let marksObtained = 0;

      if (question.type === 'mcq') {
        isCorrect = question.correctAnswer === answer.answer;
        marksObtained = isCorrect ? question.marks : 0;
      } else {
        // For descriptive and short-answer, manual grading required
        marksObtained = 0;
      }

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

    const examResult = new ExamResult({
      examId,
      studentId,
      answers: processedAnswers,
      totalMarks: exam.totalMarks,
      marksObtained: totalMarksObtained,
      percentage: parseFloat(percentage),
      isPassed,
      status: 'submitted',
      submitTime: new Date(),
      timeTaken: timeTaken || 0
    });

    await examResult.save();

    res.status(201).json({
      msg: 'Exam submitted successfully',
      result: {
        marksObtained: totalMarksObtained,
        totalMarks: exam.totalMarks,
        percentage: parseFloat(percentage),
        grade: examResult.grade,
        isPassed
      }
    });
  } catch (error) {
    console.error('Error submitting exam result:', error);
    res.status(500).json({ msg: 'Error submitting exam result', error: error.message });
  }
};

// Get all exam results
exports.getExamResults = async (req, res) => {
  try {
    const { examId, studentId, status } = req.query;
    
    let query = {};
    if (examId) query.examId = examId;
    if (studentId) query.studentId = studentId;
    if (status) query.status = status;

    const results = await ExamResult.find(query)
      .populate('examId', 'title course batch examDate totalMarks')
      .populate('studentId', 'name email rollNumber course batch')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({ msg: 'Error fetching exam results', error: error.message });
  }
};

// Get results by exam ID
exports.getResultsByExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }

    const results = await ExamResult.find({ examId })
      .populate('studentId', 'name email rollNumber course batch')
      .sort({ marksObtained: -1 });

    res.json({
      exam,
      results
    });
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({ msg: 'Error fetching exam results', error: error.message });
  }
};

// Get results by student ID
exports.getResultsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    const results = await ExamResult.find({ studentId })
      .populate('examId', 'title course batch examDate totalMarks')
      .sort({ createdAt: -1 });

    res.json({
      student,
      results
    });
  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({ msg: 'Error fetching student results', error: error.message });
  }
};

// Grade exam result (manual grading)
exports.gradeExamResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const { gradingData } = req.body;

    const examResult = await ExamResult.findById(resultId).populate('examId');
    if (!examResult) {
      return res.status(404).json({ msg: 'Exam result not found' });
    }

    // Update marks based on grading data
    let totalMarksObtained = 0;
    const updatedAnswers = examResult.answers.map(answer => {
      const grading = gradingData[answer.questionId];
      if (grading) {
        totalMarksObtained += grading.marksObtained || 0;
        return {
          ...answer,
          marksObtained: grading.marksObtained || 0,
          remarks: grading.remarks || ''
        };
      }
      totalMarksObtained += answer.marksObtained || 0;
      return answer;
    });

    const percentage = (totalMarksObtained / examResult.totalMarks * 100).toFixed(2);
    const isPassed = totalMarksObtained >= examResult.examId.passingMarks;

    examResult.answers = updatedAnswers;
    examResult.marksObtained = totalMarksObtained;
    examResult.percentage = parseFloat(percentage);
    examResult.isPassed = isPassed;
    examResult.status = 'submitted';
    examResult.reviewedBy = req.user.id;
    examResult.reviewedAt = new Date();

    await examResult.save();

    res.json({
      msg: 'Grades updated successfully',
      result: examResult
    });
  } catch (error) {
    console.error('Error grading exam result:', error);
    res.status(500).json({ msg: 'Error grading exam result', error: error.message });
  }
};

// Delete exam result
exports.deleteExamResult = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await ExamResult.findByIdAndDelete(resultId);
    if (!result) {
      return res.status(404).json({ msg: 'Exam result not found' });
    }

    res.json({ msg: 'Exam result deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam result:', error);
    res.status(500).json({ msg: 'Error deleting exam result', error: error.message });
  }
};

// Report functions
exports.getExamReports = {
  // Exam-wise report
  examWise: async (req, res) => {
    try {
      const { examId } = req.query;

      if (!examId) {
        return res.status(400).json({ msg: 'Exam ID is required' });
      }

      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({ msg: 'Exam not found' });
      }

      const results = await ExamResult.find({ examId })
        .populate('studentId', 'name rollNumber course batch')
        .sort({ marksObtained: -1 });

      const totalStudents = results.length;
      const passedStudents = results.filter(r => r.isPassed).length;
      const failedStudents = totalStudents - passedStudents;
      const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : 0;
      
      const marks = results.map(r => r.marksObtained);
      const averageScore = marks.length > 0 ? (marks.reduce((sum, mark) => sum + mark, 0) / marks.length).toFixed(1) : 0;
      const highestScore = marks.length > 0 ? Math.max(...marks) : 0;
      const lowestScore = marks.length > 0 ? Math.min(...marks) : 0;

      res.json({
        exam,
        results,
        statistics: {
          totalStudents,
          passedStudents,
          failedStudents,
          passRate: parseFloat(passRate),
          averageScore: parseFloat(averageScore),
          highestScore,
          lowestScore
        }
      });
    } catch (error) {
      console.error('Error generating exam-wise report:', error);
      res.status(500).json({ msg: 'Error generating report', error: error.message });
    }
  },

  // Course-wise report
  courseWise: async (req, res) => {
    try {
      const { course, batch } = req.query;

      if (!course || !batch) {
        return res.status(400).json({ msg: 'Course and batch are required' });
      }

      const exams = await Exam.find({ course, batch, isActive: true });
      const examIds = exams.map(exam => exam._id);

      const reportData = [];

      for (const exam of exams) {
        const results = await ExamResult.find({ examId: exam._id });
        
        const totalStudents = results.length;
        const passedStudents = results.filter(r => r.isPassed).length;
        const failedStudents = totalStudents - passedStudents;
        const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : 0;
        
        const marks = results.map(r => r.marksObtained);
        const averageScore = marks.length > 0 ? (marks.reduce((sum, mark) => sum + mark, 0) / marks.length).toFixed(1) : 0;
        const highestScore = marks.length > 0 ? Math.max(...marks) : 0;
        const lowestScore = marks.length > 0 ? Math.min(...marks) : 0;

        reportData.push({
          examId: exam._id,
          examTitle: exam.title,
          examDate: exam.examDate,
          totalStudents,
          passedStudents,
          failedStudents,
          passRate: parseFloat(passRate),
          averageScore: parseFloat(averageScore),
          highestScore,
          lowestScore
        });
      }

      res.json(reportData);
    } catch (error) {
      console.error('Error generating course-wise report:', error);
      res.status(500).json({ msg: 'Error generating report', error: error.message });
    }
  },

  // Batch-wise report
  batchWise: async (req, res) => {
    try {
      const { batch, course } = req.query;

      if (!batch) {
        return res.status(400).json({ msg: 'Batch is required' });
      }

      let query = { batch, isActive: true };
      if (course) query.course = course;

      const exams = await Exam.find(query);
      const reportData = [];

      for (const exam of exams) {
        const results = await ExamResult.find({ examId: exam._id });
        
        const totalStudents = results.length;
        const passedStudents = results.filter(r => r.isPassed).length;
        const failedStudents = totalStudents - passedStudents;
        const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : 0;
        
        const marks = results.map(r => r.marksObtained);
        const averageScore = marks.length > 0 ? (marks.reduce((sum, mark) => sum + mark, 0) / marks.length).toFixed(1) : 0;
        const highestScore = marks.length > 0 ? Math.max(...marks) : 0;
        const lowestScore = marks.length > 0 ? Math.min(...marks) : 0;

        reportData.push({
          examId: exam._id,
          examTitle: exam.title,
          examDate: exam.examDate,
          totalStudents,
          passedStudents,
          failedStudents,
          passRate: parseFloat(passRate),
          averageScore: parseFloat(averageScore),
          highestScore,
          lowestScore
        });
      }

      res.json(reportData);
    } catch (error) {
      console.error('Error generating batch-wise report:', error);
      res.status(500).json({ msg: 'Error generating report', error: error.message });
    }
  },

  // Date range report
  dateRange: async (req, res) => {
    try {
      const { startDate, endDate, course, batch } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ msg: 'Start date and end date are required' });
      }

      let query = {
        examDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        isActive: true
      };

      if (course) query.course = course;
      if (batch) query.batch = batch;

      const exams = await Exam.find(query);
      const reportData = [];

      for (const exam of exams) {
        const results = await ExamResult.find({ examId: exam._id });
        
        const totalStudents = results.length;
        const passedStudents = results.filter(r => r.isPassed).length;
        const failedStudents = totalStudents - passedStudents;
        const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : 0;
        
        const marks = results.map(r => r.marksObtained);
        const averageScore = marks.length > 0 ? (marks.reduce((sum, mark) => sum + mark, 0) / marks.length).toFixed(1) : 0;
        const highestScore = marks.length > 0 ? Math.max(...marks) : 0;
        const lowestScore = marks.length > 0 ? Math.min(...marks) : 0;

        reportData.push({
          examId: exam._id,
          examTitle: exam.title,
          course: exam.course,
          batch: exam.batch,
          examDate: exam.examDate,
          totalStudents,
          passedStudents,
          failedStudents,
          passRate: parseFloat(passRate),
          averageScore: parseFloat(averageScore),
          highestScore,
          lowestScore
        });
      }

      res.json(reportData);
    } catch (error) {
      console.error('Error generating date range report:', error);
      res.status(500).json({ msg: 'Error generating report', error: error.message });
    }
  }
};
