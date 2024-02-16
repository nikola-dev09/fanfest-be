const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

module.exports = async (socket, next) => {
  try {
    const token = socket.handshake.headers.access_token;
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload._id);

    if (!user) {
      return next(new Error('Authentication error'));
    }

    socket.request.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};
