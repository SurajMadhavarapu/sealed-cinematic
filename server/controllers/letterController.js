const pool = require('../config/db');

// @route   POST /api/vaults/:vaultId/letters
// @desc    Create a new letter
exports.createLetter = async (req, res, next) => {
  try {
    const { vaultId } = req.params;
    const { title, content, unlockType, unlockDate } = req.body;
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
    const validUnlockTypes = ['date', 'consensus'];
    if (!validUnlockTypes.includes(unlockType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid unlock type. Must be: date or consensus',
      });
    }

    // Validate based on unlock type
    if (unlockType === 'date' && !unlockDate) {
      return res.status(400).json({
        success: false,
        message: 'Unlock date is required for date-based letters',
      });
    }

    if (unlockType === 'date') {
      const parsedUnlockDate = new Date(unlockDate);
      if (Number.isNaN(parsedUnlockDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Unlock date is invalid',
        });
      }

      if (parsedUnlockDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Unlock date must be in the future',
        });
      }
    }

    if (unlockType === 'consensus' && unlockDate) {
      return res.status(400).json({
        success: false,
        message: 'Consensus letters cannot include an unlock date',
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
        content, // Prototype only: client-side encryption is still pending.
        unlockType,
        unlockType === 'date' ? new Date(unlockDate) : null,
        null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Letter sealed successfully',
      data: { letter: { ...result.rows[0], content: null } },
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

    // Date letters become eligible only after server time passes.
    await pool.query(
      `UPDATE letters 
       SET is_unlocked = TRUE, unlocked_at = NOW()
       WHERE vault_id = $1 
         AND (
           unlock_type = 'date' AND unlock_date <= NOW()
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

    // Auto-unlock date letters only after server time passes.
    await pool.query(
      `UPDATE letters 
       SET is_unlocked = TRUE, unlocked_at = NOW()
       WHERE id = $1 
         AND vault_id = $2
         AND (
           unlock_type = 'date' AND unlock_date <= NOW()
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

    const memberCheck = await pool.query(
      'SELECT id FROM vault_members WHERE vault_id = $1 AND user_id = $2',
      [vaultId, userId]
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'You are not a member of this vault' });
    }

    if ((title === undefined && content === undefined) ||
        (title !== undefined && (typeof title !== 'string' || !title.trim() || title.length > 255)) ||
        (content !== undefined && (typeof content !== 'string' || !content.trim()))) {
      return res.status(400).json({ success: false, message: 'Provide a non-empty title (up to 255 characters) or content' });
    }

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
         AND is_unlocked = FALSE
         AND (unlock_type = 'consensus' OR (unlock_type = 'date' AND unlock_date > clock_timestamp()))
         AND EXISTS (SELECT 1 FROM vault_members WHERE vault_id = $4 AND user_id = $5)
       RETURNING *`,
      [title, content, letterId, vaultId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ success: false, message: 'Letter is no longer editable' });
    }

    res.json({
      success: true,
      message: 'Letter updated',
      data: { letter: { ...result.rows[0], content: null } },
    });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/vaults/:vaultId/letters/:letterId/unlock
// @desc    Unlock an eligible date-based letter
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

    if (letter.unlock_type !== 'date') {
      return res.status(403).json({
        success: false,
        message: 'Only date-based letters can be manually unsealed',
      });
    }

    if (!letter.unlock_date || new Date(letter.unlock_date) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Letter cannot be unsealed before its unlock date',
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
