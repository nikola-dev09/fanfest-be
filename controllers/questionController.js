const Question = require('../models/Question');

const createQuestion = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      res.status(400).json({
        success: false,
        message:
          'Malformed request. Make sure question and answer are present in the body'
      });
    }
    await Question.create({
      question,
      answer: answer.toLowerCase()
    });
    res.status(201).json({
      success: true,
      message: 'Question answer pair added successfully'
    });
  } catch (error) {
    console.error('Creating question failed:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create new question answer pair'
    });
  }
};

module.exports = {
  createQuestion
};
