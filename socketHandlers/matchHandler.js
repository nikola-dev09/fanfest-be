const {
  initiateMatch,
  addScore,
  userQueue
} = require('../controllers/matchController');
const Question = require('../models/Question');
const Match = require('../models/Match');

module.exports = function (io) {
  io.on('connection', async (socket) => {
    const user = socket.request.user;

    socket.on('submit_answer', async (data) => {
      const { question_id, answer } = data;

      const roomName = Array.from(socket.rooms).filter((roomId) =>
        roomId.startsWith('match')
      )[0];
      if (!roomName) return;
      const matchId = roomName.split('_')[1];

      const match = await addScore(matchId, user.id, question_id, answer);
      // Both players have answered
      if (match.scores.at(-1).length === 2) {
        const questionIndex = match.questions.findIndex(
          (q) => q.toString() === question_id
        );
        if (questionIndex + 1 < match.questions.length) {
          // Move onto the next question
          const q = await Question.findById(match.questions[questionIndex + 1]);
          match.scores.push([]);
          await match.save();
          io.to(roomName).emit('question', { id: q._id, question: q.question });
        } else {
          // Game finished
          calculateScoreAndEndMatch(match, io, roomName);
        }
      }
    });

    socket.on('disconnecting', async () => {
      const roomName = Array.from(socket.rooms).filter((roomId) =>
        roomId.startsWith('match')
      )[0];

      if (!roomName) return;
      const matchId = roomName.split('_')[1];
      const match = await Match.findById(matchId);
      calculateScoreAndEndMatch(match, io, roomName);
    });

    if (!userQueue.isEmpty()) {
      // Start a new game
      const secondPlayer = userQueue.dequeue();

      const match = await initiateMatch(user, secondPlayer.user);
      const roomName = `match_${match._id}`;
      socket.join(roomName);
      io.in(secondPlayer.socketId).socketsJoin(roomName);
      io.to(roomName).emit('game_commence');

      const q = await Question.findById(match.questions[0]);
      io.to(roomName).emit('question', { id: q._id, question: q.question });
      match.scores.push([]);
      await match.save();
    } else {
      // Wait for 2nd player
      userQueue.enqueue({ user, socketId: socket.id });
    }
  });
};

const calculateScoreAndEndMatch = (match, io, roomName) => {
  const scoreHash = {};
  match.scores.forEach((score) => {
    score.forEach(({ user, correct }) => {
      scoreHash[user] = (scoreHash[user] || 0) + (correct ? 1 : 0);
    });
  });

  if (match.scores.length === 1 && match.scores[0].length <= 1) {
    // Only one player answered. And one of them disconnected
    io.to(roomName).emit('game_finish', {
      message: `Another player disconnected without answering. You won!`
    });
  } else {
    const [[p1, s1], [p2, s2]] = Object.entries(scoreHash);
    if (s1 === s2) {
      io.to(roomName).emit('game_finish', {
        message: `Game tied. You both scored ${s1}`
      });
    } else if (s1 > s2) {
      io.to(roomName).emit('game_finish', {
        message: `${p1} won with ${s1} score`
      });
    } else {
      io.to(roomName).emit('game_finish', {
        message: `${p2} won with ${s2} score`
      });
    }
  }

  // Discard the room
  io.in(roomName).socketsLeave(roomName);
};
