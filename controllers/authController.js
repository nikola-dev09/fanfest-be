const User = require('../models/User');

const signupUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message:
          'Malformed request. Make sure username and password are present in the body'
      });
    }

    let user = await User.findOne({ username: username });
    if (user) {
      return res.status(400).send("User already existed");
    }

    user = new User({
      username: username,
      password: password
    });

    await user.save();
    res.status(201).json({ success: true, message: 'Signed up successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({
        success: false,
        message:
          'Malformed request. Make sure username and password are present in the body'
      });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'User not found' });
    }

    if (user.isPasswordValid(password)) {
      const token = user.generateAuthToken();
      res
      .status(200)
      .json({ success: true, message: 'Logged in successfully', data: token });
    } else {
      return res.status(401).send("Invalid login credential");
    }
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
    next(error);
  }
};

module.exports = {
  signupUser,
  loginUser
};
