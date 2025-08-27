const User = require('../models/User');

const signupUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log(req.body);

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message:
          'Malformed request. Make sure username and password are present in the body'
      });
    }

    let user = await User.findOne({ username: username });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    user = new User({
      username: username,
      password: password
    });

    await user.save();
    return res.status(201).json({ success: true, message: 'Signed up successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    console.log(req.body);
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message:
          'Malformed request. Make sure username and password are present in the body'
      });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.isPasswordValid(password)) {
      return res.status(401).json({ success: false, message: 'Invalid login credential' });
    }

    const token = user.generateAuthToken();
    return res.status(200).json({ success: true, message: 'Logged in successfully', data: token });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  signupUser,
  loginUser
};
