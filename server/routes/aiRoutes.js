const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPrompts } = require('../controllers/aiController');
const { aiLimiter, blockSuspiciousAgents } = require('../middleware/security');

router.post('/prompts', protect, blockSuspiciousAgents, aiLimiter, getPrompts);

module.exports = router;
