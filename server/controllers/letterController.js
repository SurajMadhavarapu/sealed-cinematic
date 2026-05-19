const pool = require('../config/db');

// @route   POST /api/vaults/:vaultId/letters
// @desc    Create a new letter
exports.createLetter = async (req, res, next) => {
  try {
    const { vaultId } = req.params;
    const { title, content, unlockType, unlockDate, unlockEvent } = req.body;
    const userId = req.user.id;

    // Validate membership
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

    // Validate required fields
    if (!title || !content || !unlockType) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and unlock type are required',
      });
    }

    // Validate unlock type
    const validUnlockTypes = ['date', 'event', 'consensus'];
    if (!validUnlockTypes.includes(unlockType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid unlock type. Must be: date, event, or consensus',
      });
    }

    // Validate based on unlock type
    if (unlockType === 'date' && !unlockDate) {
      return res.status(400).json({
        success: false,
        message: 'Unlock date is required for date-based letters',
      });
    }

    if (unlockType === 'event' && !unlockEvent) {
      return res.status(400).json({
        success: false,
        message: 'Unlock event description is required',
      });
    }

    // Create letter
    const result = await pool.query(
      `INSERT INTO letters (vault_id, author_id, title, content, unlock_type, unlock_date, unlock_event)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        vaultId,
        userId,
        title,
        content, // In production, encrypt this
        unlockType,
        unlockType === 'date' ? new Date(unlockDate) : null,
        unlockType === 'event' ? unlockEvent : null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Letter sealed successfully',
      data: { letter: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/vaults/:vaultId/letters
// @desc    Get all letters in vault (titles only for locked)
exports.getLetters = async (req, res, next) => {
  try {
    const { vaultId } = req.params;
    const userId = req.user.id;

    // Validate membership
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

    // Check for auto-unlock (date-based letters and event-based letters)
    await pool.query(
      `UPDATE letters 
       SET is_unlocked = TRUE, unlocked_at = NOW()
       WHERE vault_id = $1 
         AND (
           (unlock_type = 'date' AND unlock_date <= NOW())
           OR unlock_type = 'event'
         )
         AND is_unlocked = FALSE`,
      [vaultId]
    );

    // Get letters with author info
    const result = await pool.query(
      `SELECT l.id, l.title, l.unlock_type, l.unlock_date, l.unlock_event,
              l.is_unlocked, l.unlocked_at, l.created_at,
              u.id as author_id, u.name as author_name,
              CASE WHEN l.is_unlocked THEN l.content ELSE NULL END as content
       FROM letters l
       JOIN users u ON l.author_id = u.id
       WHERE l.vault_id = $1
       ORDER BY l.created_at DESC`,
      [vaultId]
    );

    res.json({
      success: true,
      data: { letters: result.rows },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/vaults/:vaultId/letters/:letterId
// @desc    Get single letter
exports.getLetter = async (req, res, next) => {
  try {
    const { vaultId, letterId } = req.params;
    const userId = req.user.id;

    // Validate membership
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

    // Auto-unlock if date passed OR event-based (events auto-unlock)
    await pool.query(
      `UPDATE letters 
       SET is_unlocked = TRUE, unlocked_at = NOW()
       WHERE id = $1 
         AND vault_id = $2
         AND (
           (unlock_type = 'date' AND unlock_date <= NOW())
           OR unlock_type = 'event'
         )
         AND is_unlocked = FALSE`,
      [letterId, vaultId]
    );

    // Get letter
    const result = await pool.query(
      `SELECT l.*, u.name as author_name
       FROM letters l
       JOIN users u ON l.author_id = u.id
       WHERE l.id = $1 AND l.vault_id = $2`,
      [letterId, vaultId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found',
      });
    }

    const letter = result.rows[0];

    // If not unlocked, hide content
    if (!letter.is_unlocked) {
      letter.content = null;
    }

    res.json({
      success: true,
      data: { letter },
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/vaults/:vaultId/letters/:letterId
// @desc    Update letter (author only, before unlock)
exports.updateLetter = async (req, res, next) => {
  try {
    const { vaultId, letterId } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    // Get existing letter
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

    // Only author can edit
    if (letter.author_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the author can edit this letter',
      });
    }

    // Can't edit unlocked letters
    if (letter.is_unlocked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit an unlocked letter',
      });
    }

    // Update
    const result = await pool.query(
      `UPDATE letters 
       SET title = COALESCE($1, title), 
           content = COALESCE($2, content)
       WHERE id = $3
         AND vault_id = $4
         AND author_id = $5
       RETURNING *`,
      [title, content, letterId, vaultId, userId]
    );

    res.json({
      success: true,
      message: 'Letter updated',
      data: { letter: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/vaults/:vaultId/letters/:letterId/unlock
// @desc    Manually unlock event-based letter
exports.unlockLetter = async (req, res, next) => {
  try {
    const { vaultId, letterId } = req.params;
    const userId = req.user.id;

    // Validate membership
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

    if (letter.is_unlocked) {
      return res.status(400).json({
        success: false,
        message: 'Letter is already unlocked',
      });
    }

    // Only author can manually unlock event-based letters
    if (letter.unlock_type === 'event' && letter.author_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the author can unlock event-based letters',
      });
    }

    // Consensus letters need voting (handled separately)
    if (letter.unlock_type === 'consensus') {
      return res.status(400).json({
        success: false,
        message: 'Consensus letters require group voting to unlock',
      });
    }

    // Unlock
    const result = await pool.query(
      `UPDATE letters 
       SET is_unlocked = TRUE, unlocked_at = NOW()
       WHERE id = $1 AND vault_id = $2
       RETURNING *`,
      [letterId, vaultId]
    );

    res.json({
      success: true,
      message: 'Letter unsealed!',
      data: { letter: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/vaults/:vaultId/letters/:letterId
// @desc    Delete a letter (only author can delete)
exports.deleteLetter = async (req, res, next) => {
  try {
    const { vaultId, letterId } = req.params;
    const userId = req.user.id;

    // Validate membership
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

    // Check if letter exists and get author_id
    const letterResult = await pool.query(
      'SELECT id, author_id, title FROM letters WHERE id = $1 AND vault_id = $2',
      [letterId, vaultId]
    );

    if (letterResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found',
      });
    }

    const letter = letterResult.rows[0];

    // Only author can delete
    if (letter.author_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the author can delete this letter',
      });
    }

    // Delete the letter
    await pool.query(
      'DELETE FROM letters WHERE id = $1 AND vault_id = $2 AND author_id = $3',
      [letterId, vaultId, userId]
    );

    res.json({
      success: true,
      message: 'Letter deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
