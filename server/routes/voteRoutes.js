const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const { castVote, getVotes } = require('../controllers/voteController');

// All routes are protected
router.use(protect);

router.route('/')
  .post(castVote)
  .get(getVotes);

module.exports = router;
