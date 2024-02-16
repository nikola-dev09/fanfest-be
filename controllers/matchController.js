const Match = require('../models/Match');
const Question = require('../models/Question');
const { Queue } = require('@datastructures-js/queue');

const userQueue = new Queue();

const initiateMatch = async (firstPlayer, secondPlayer) => {
  const questions = await Question.aggregate([{ $sample: { size: 2 } }]);
  const newMatch = new Match({
    questions,
    players: [firstPlayer._id, secondPlayer._id],
    scores: []
  });
  await newMatch.save();
  return newMatch;
};

const addScore = async (matchId, userId, questionId, answer) => {
  const match = await Match.findById(matchId);

  const question = await Question.findById(questionId);
  const isAnswerCorrect = question.answer === answer.toLowerCase();
  match.scores.at(-1).push({ user: userId, correct: isAnswerCorrect });

  await match.save();
  return match;
};

module.exports = {
  addScore,
  initiateMatch,
  userQueue
};
