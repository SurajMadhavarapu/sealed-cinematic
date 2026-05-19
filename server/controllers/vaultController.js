const pool = require('../config/db');
const crypto = require('crypto');

// Generate random invite code
const generateInviteCode = () => {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
};

// @route   POST /api/vaults
// @desc    Create a new vault
exports.createVault = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Vault name is required',
      });
    }

    // Create vault
    const vaultResult = await pool.query(
      `INSERT INTO vaults (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, userId]
    );

    const vault = vaultResult.rows[0];

    // Add creator as owner
    await pool.query(
      `INSERT INTO vault_members (vault_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [vault.id, userId]
    );

    res.status(201).json({
      success: true,
      message: 'Vault created successfully',
      data: { vault },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/vaults
// @desc    Get all vaults for current user
exports.getMyVaults = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT v.*, vm.role,
        (SELECT COUNT(*) FROM vault_members WHERE vault_id = v.id) as member_count,
        (SELECT COUNT(*) FROM letters WHERE vault_id = v.id) as letter_count
       FROM vaults v
       JOIN vault_members vm ON v.id = vm.vault_id
       WHERE vm.user_id = $1
       ORDER BY v.updated_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: { vaults: result.rows },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/vaults/:vaultId
// @desc    Get single vault with members
exports.getVault = async (req, res, next) => {
  try {
    const { vaultId } = req.params;
    const userId = req.user.id;

    // Check membership
    const memberCheck = await pool.query(
      'SELECT role FROM vault_members WHERE vault_id = $1 AND user_id = $2',
      [vaultId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this vault',
      });
    }

    // Get vault details
    const vaultResult = await pool.query(
      'SELECT * FROM vaults WHERE id = $1',
      [vaultId]
    );

    if (vaultResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vault not found',
      });
    }

    // Get members
    const membersResult = await pool.query(
      `SELECT u.id, u.name, u.email, vm.role, vm.joined_at
       FROM vault_members vm
       JOIN users u ON vm.user_id = u.id
       WHERE vm.vault_id = $1
       ORDER BY vm.joined_at`,
      [vaultId]
    );

    res.json({
      success: true,
      data: {
        vault: vaultResult.rows[0],
        members: membersResult.rows,
        userRole: memberCheck.rows[0].role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/vaults/:vaultId/invite
// @desc    Generate invite code
exports.generateInvite = async (req, res, next) => {
  try {
    const { vaultId } = req.params;
    const userId = req.user.id;

    // Check if user is owner
    const memberCheck = await pool.query(
      'SELECT role FROM vault_members WHERE vault_id = $1 AND user_id = $2',
      [vaultId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this vault',
      });
    }

    if (memberCheck.rows[0].role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only vault owners can generate invite codes',
      });
    }

    const inviteCode = generateInviteCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await pool.query(
      `UPDATE vaults 
       SET invite_code = $1, invite_expires_at = $2
       WHERE id = $3`,
      [inviteCode, expiresAt, vaultId]
    );

    res.json({
      success: true,
      message: 'Invite code generated',
      data: {
        inviteCode,
        expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/vaults/join
// @desc    Join vault with invite code
exports.joinVault = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user.id;

    if (!inviteCode) {
      return res.status(400).json({
        success: false,
        message: 'Invite code is required',
      });
    }

    // Find vault by invite code
    const vaultResult = await pool.query(
      `SELECT * FROM vaults 
       WHERE invite_code = $1 AND invite_expires_at > NOW()`,
      [inviteCode.toUpperCase()]
    );

    if (vaultResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired invite code',
      });
    }

    const vault = vaultResult.rows[0];

    // Check if already a member
    const existingMember = await pool.query(
      'SELECT id FROM vault_members WHERE vault_id = $1 AND user_id = $2',
      [vault.id, userId]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this vault',
      });
    }

    // Add as member
    await pool.query(
      `INSERT INTO vault_members (vault_id, user_id, role)
       VALUES ($1, $2, 'member')`,
      [vault.id, userId]
    );

    // Clear invite code after use (optional: one-time use)
    await pool.query(
      `UPDATE vaults SET invite_code = NULL, invite_expires_at = NULL WHERE id = $1`,
      [vault.id]
    );

    res.json({
      success: true,
      message: `You have joined "${vault.name}"`,
      data: { vault },
    });
  } catch (error) {
    next(error);
  }
};
