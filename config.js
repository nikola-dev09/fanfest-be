const dotenv = require('dotenv');

try {
  dotenv.config();
} catch (e) {
  console.log(e);
}

module.exports = {
  mongoURL: process.env.MONGO_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpires: process.env.JWT_EXPIRES
};
