const Question = require('../models/Question');
const QuestionGroup = require('../models/QuestionGroup');

// Add a single question
exports.addQuestion = async (req, res) => {
  try {
    const { type, question, options, correctAnswer, marks, groupId, course, subject } = req.body;
    
    if (!type || !question || !course) {
      return res.status(400).json({ msg: 'Required fields missing' });
    }

    const newQuestion = new Question({
      type,
      question,
      options,
      correctAnswer,
      marks,
      groupId,
      course,
      subject,
      createdBy: req.user.id
    });

    await newQuestion.save();
    res.status(201).json({ msg: 'Question added successfully', question: newQuestion });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ msg: 'Error adding question', error: error.message });
  }
};

// Bulk add questions
exports.bulkAddQuestions = async (req, res) => {
  try {
    const { questions, groupId, course, subject: bulkSubject } = req.body; // questions is an array
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ msg: 'No questions provided' });
    }

    const questionsWithMeta = questions.map(q => ({
      ...q,
      groupId: q.groupId || groupId,
      course: q.course || course,
      subject: q.subject || bulkSubject,
      createdBy: req.user.id
    }));

    const result = await Question.insertMany(questionsWithMeta);
    res.status(201).json({ msg: `${result.length} questions added successfully`, result });
  } catch (error) {
    console.error('Error bulk adding questions:', error);
    res.status(500).json({ msg: 'Error bulk adding questions', error: error.message });
  }
};

// Get questions (with filters and pagination)
exports.getQuestions = async (req, res) => {
  try {
    const { groupId, course, subject, type, page = 1, limit = 10, search } = req.query;
    let query = { createdBy: req.user.id };
    if (groupId) query.groupId = groupId;
    if (course) query.course = course;
    if (subject) query.subject = subject;
    if (type) query.type = type;
    if (search) query.question = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      questions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ msg: 'Error fetching questions', error: error.message });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
 
    const question = await Question.findOneAndUpdate(
      { _id: id, createdBy: req.user.id },
      updateData,
      { new: true }
    );
    if (!question) {
      return res.status(404).json({ msg: 'Question not found or unauthorized' });
    }

    res.json({ msg: 'Question updated successfully', question });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ msg: 'Error updating question', error: error.message });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findOneAndDelete({
      _id: id,
      createdBy: req.user.id
    });
    if (!question) {
      return res.status(404).json({ msg: 'Question not found or unauthorized' });
    }
    res.json({ msg: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ msg: 'Error deleting question', error: error.message });
  }
};

// Assign questions to group
exports.assignToGroup = async (req, res) => {
  try {
    const { questionIds, groupId } = req.body;
    if (!questionIds || !Array.isArray(questionIds) || !groupId) {
      return res.status(400).json({ msg: 'Invalid payload' });
    }

    await Question.updateMany(
      { _id: { $in: questionIds }, createdBy: req.user.id },
      { $set: { groupId: groupId } }
    );

    res.json({ msg: 'Questions assigned to group successfully' });
  } catch (error) {
    console.error('Error assigning questions to group:', error);
    res.status(500).json({ msg: 'Error assigning questions to group', error: error.message });
  }
};
