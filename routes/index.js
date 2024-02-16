const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const questionRoutes = require('./questionRoutes');
const authMiddleware = require('../middlewares/authMiddleware');

router.use('/auth', authRoutes);
router.use('/questions', authMiddleware, questionRoutes);

module.exports = router;
