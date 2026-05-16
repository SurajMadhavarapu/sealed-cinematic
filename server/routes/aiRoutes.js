const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPrompts } = require('../controllers/aiController');

router.post('/prompts', protect, getPrompts);

module.exports = router;
