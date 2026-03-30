const QuestionGroup = require('../models/QuestionGroup');
const Question = require('../models/Question');

// Create a new question group
exports.createGroup = async (req, res) => {
  try {
    const { name, course } = req.body;
    if (!name || !course) {
      return res.status(400).json({ msg: 'Please provide name and course' });
    }

    const group = new QuestionGroup({
      name,
      course,
      createdBy: req.user.id
    });

    await group.save();
    res.status(201).json({ msg: 'Question group created successfully', group });
  } catch (error) {
    console.error('Error creating question group:', error);
    res.status(500).json({ msg: 'Error creating question group', error: error.message });
  }
};

// Get all question groups
exports.getGroups = async (req, res) => {
  try {
    const { course } = req.query;
    let query = { createdBy: req.user.id };
    if (course) query.course = course;

    const groups = await QuestionGroup.find(query).sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    console.error('Error fetching question groups:', error);
    res.status(500).json({ msg: 'Error fetching question groups', error: error.message });
  }
};

// Delete a question group
exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if there are questions in this group
    const questionCount = await Question.countDocuments({ groupId: id });
    if (questionCount > 0) {
      return res.status(400).json({ msg: 'Cannot delete group with questions. Please reassign or delete questions first.' });
    }

    const group = await QuestionGroup.findOneAndDelete({
      _id: id,
      createdBy: req.user.id
    });
    if (!group) {
      return res.status(404).json({ msg: 'Group not found or unauthorized' });
    }

    res.json({ msg: 'Question group deleted successfully' });
  } catch (error) {
    console.error('Error deleting question group:', error);
    res.status(500).json({ msg: 'Error deleting question group', error: error.message });
  }
};
