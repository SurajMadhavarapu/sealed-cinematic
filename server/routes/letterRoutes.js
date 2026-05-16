const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const {
  createLetter,
  getLetters,
  getLetter,
  updateLetter,
  unlockLetter,
  deleteLetter,
} = require('../controllers/letterController');

// All routes are protected
router.use(protect);

router.route('/')
  .post(createLetter)
  .get(getLetters);

router.route('/:letterId')
  .get(getLetter)
  .put(updateLetter)
  .delete(deleteLetter);

router.patch('/:letterId/unlock', unlockLetter);

module.exports = router;
