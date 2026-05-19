const pool = require('../config/db');

// @route   POST /api/vaults/:vaultId/letters/:letterId/votes
// @desc    Cast a vote on a consensus letter
exports.castVote = async (req, res, next) => {
  try {
    const { vaultId, letterId } = req.params;
    const { vote } = req.body;
    const userId = req.user.id;

    // Validate vote value
    if (!['yes', 'no'].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: 'Vote must be "yes" or "no"',
      });
    }

    // Check membership
    const memberCheck = await pool.query(
      'SELECT id FROM vault_members WHERE vault_id = $1 AND user_id = $2',
      [vaultId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this vault',
      });
    }

    // Get letter
    const letterResult = await pool.query(
      'SELECT * FROM letters WHERE id = $1 AND vault_id = $2',
      [letterId, vaultId]
    );

    if (letterResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found',
      });
    }

    const letter = letterResult.rows[0];

    // Only consensus letters can be voted on
    if (letter.unlock_type !== 'consensus') {
      return res.status(400).json({
        success: false,
        message: 'Only consensus letters can be voted on',
      });
    }

    if (letter.is_unlocked) {
      return res.status(400).json({
        success: false,
        message: 'Letter is already unlocked',
      });
    }

    // Upsert vote
    await pool.query(
      `INSERT INTO votes (letter_id, user_id, vote)
       VALUES ($1, $2, $3)
       ON CONFLICT (letter_id, user_id) 
       DO UPDATE SET vote = $3`,
      [letterId, userId, vote]
    );

    // Check if consensus reached
    const memberCount = await pool.query(
      'SELECT COUNT(*) as count FROM vault_members WHERE vault_id = $1',
      [vaultId]
    );

    const yesVotes = await pool.query(
      `SELECT COUNT(*) as count FROM votes 
       WHERE letter_id = $1 AND vote = 'yes'`,
      [letterId]
    );

    const totalMembers = parseInt(memberCount.rows[0].count);
    const totalYes = parseInt(yesVotes.rows[0].count);

    // Unlock if all members voted yes
    let unlocked = false;
    if (totalYes === totalMembers) {
      await pool.query(
        `UPDATE letters 
         SET is_unlocked = TRUE, unlocked_at = NOW()
         WHERE id = $1 AND vault_id = $2`,
        [letterId, vaultId]
      );
      unlocked = true;
    }

    res.json({
      success: true,
      message: unlocked 
        ? 'Consensus reached! Letter unsealed!' 
        : 'Vote recorded',
      data: {
        vote,
        yesVotes: totalYes,
        totalMembers,
        unlocked,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/vaults/:vaultId/letters/:letterId/votes
// @desc    Get votes for a letter
exports.getVotes = async (req, res, next) => {
  try {
    const { vaultId, letterId } = req.params;
    const userId = req.user.id;

    // Check membership
    const memberCheck = await pool.query(
      'SELECT id FROM vault_members WHERE vault_id = $1 AND user_id = $2',
      [vaultId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this vault',
      });
    }

    // Ensure the requested letter belongs to this vault
    const letterResult = await pool.query(
      'SELECT id, unlock_type FROM letters WHERE id = $1 AND vault_id = $2',
      [letterId, vaultId]
    );

    if (letterResult.rows.length === 0) {
      return res.status(404).json({
       success: false,
       message: 'Letter not found',
      });
    }

    if (letterResult.rows[0].unlock_type !== 'consensus') {
      return res.status(400).json({
       success: false,
       message: 'Votes are only available for consensus letters',
      });
    }

    // Get votes with user info
    const result = await pool.query(
      `SELECT v.vote, v.created_at, u.id as user_id, u.name
       FROM votes v
       JOIN users u ON v.user_id = u.id
       JOIN letters l ON l.id = v.letter_id
       WHERE v.letter_id = $1 AND l.vault_id = $2
       ORDER BY v.created_at`,
      [letterId, vaultId]
    );

    // Get member count for progress
    const memberCount = await pool.query(
      'SELECT COUNT(*) as count FROM vault_members WHERE vault_id = $1',
      [vaultId]
    );

    const yesCount = result.rows.filter(v => v.vote === 'yes').length;
    const noCount = result.rows.filter(v => v.vote === 'no').length;

    res.json({
      success: true,
      data: {
        votes: result.rows,
        summary: {
          yes: yesCount,
          no: noCount,
          total: result.rows.length,
          required: parseInt(memberCount.rows[0].count),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
