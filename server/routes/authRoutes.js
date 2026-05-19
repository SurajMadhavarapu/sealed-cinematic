const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginLimiter, registerLimiter, blockSuspiciousAgents } = require('../middleware/security');

router.post('/register', blockSuspiciousAgents, registerLimiter, register);
router.post('/login', blockSuspiciousAgents, loginLimiter, login);
router.get('/me', protect, getMe);

module.exports = router;
