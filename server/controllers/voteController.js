const pool = require('../config/db');
const transaction = require('../utils/transaction');
const failure = (status, message) => ({ status, body: { success: false, message } });

// Serialize joins and votes on the vault, then lock the letter before changing votes.
exports.castVote = async (req, res, next) => {
  try {
    const { vaultId, letterId } = req.params;
    const { vote } = req.body;
    const userId = req.user.id;
    if (!['yes', 'no'].includes(vote)) {
      return res.status(400).json({ success: false, message: 'Vote must be "yes" or "no"' });
    }
    const result = await transaction(pool, async (client) => {
      await client.query('SELECT id FROM vaults WHERE id = $1 FOR UPDATE', [vaultId]);
      const membership = await client.query(
        'SELECT id FROM vault_members WHERE vault_id = $1 AND user_id = $2', [vaultId, userId]
      );
      if (!membership.rows.length) return failure(403, 'You are not a member of this vault');
      const found = await client.query(
        'SELECT id, unlock_type, is_unlocked FROM letters WHERE id = $1 AND vault_id = $2 FOR UPDATE',
        [letterId, vaultId]
      );
      if (!found.rows.length) return failure(404, 'Letter not found');
      const letter = found.rows[0];
      if (letter.unlock_type !== 'consensus') return failure(400, 'Only consensus letters can be voted on');
      if (letter.is_unlocked) return failure(400, 'Letter is already unlocked');
      await client.query(
        `INSERT INTO votes (letter_id, user_id, vote) VALUES ($1, $2, $3)
         ON CONFLICT (letter_id, user_id) DO UPDATE SET vote = EXCLUDED.vote`,
        [letterId, userId, vote]
      );
      const counts = await client.query(
        `SELECT COUNT(*)::int AS members,
                COUNT(*) FILTER (WHERE v.vote = 'yes')::int AS yes
         FROM vault_members m
         LEFT JOIN votes v ON v.user_id = m.user_id AND v.letter_id = $2
         WHERE m.vault_id = $1`, [vaultId, letterId]
      );
      const { members, yes } = counts.rows[0];
      const unlocked = members > 0 && members === yes;
      if (unlocked) {
        await client.query(
          'UPDATE letters SET is_unlocked = TRUE, unlocked_at = clock_timestamp() WHERE id = $1 AND vault_id = $2',
          [letterId, vaultId]
        );
      }
      return { status: 200, body: {
        success: true,
        message: unlocked ? 'Consensus reached! Letter unsealed!' : 'Vote recorded',
        data: { vote, yesVotes: yes, totalMembers: members, unlocked },
      } };
    });
    res.status(result.status).json(result.body);
  } catch (error) { next(error); }
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
       JOIN vault_members m ON m.vault_id = l.vault_id AND m.user_id = v.user_id
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
