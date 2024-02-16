const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

userSchema.methods.generateAuthToken = function generateAuthToken() {
  const token = jwt.sign({ _id: this._id }, config.jwtSecret, { expiresIn: config.jwtExpires });
	return token;
}

userSchema.methods.encryptPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

userSchema.methods.isPasswordValid = function isPasswordValid(password) {
	return bcrypt.compareSync(password, this.password);
}

userSchema.pre("save", function (next) {
	if(this.password && this.isModified('password')) {
		this.password = this.encryptPassword(this.password);
		next();
	} else {
		next();
	}
}); 

module.exports = mongoose.model('User', userSchema);
