const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createVault,
  getMyVaults,
  getVault,
  generateInvite,
  joinVault,
} = require('../controllers/vaultController');

// All routes are protected
router.use(protect);

router.route('/')
  .post(createVault)
  .get(getMyVaults);

router.get('/:vaultId', getVault);
router.post('/:vaultId/invite', generateInvite);
router.post('/join', joinVault);

module.exports = router;
