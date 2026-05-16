const pool = require('../config/db');

// Check and auto-unlock date-based letters
const checkAndUnlockLetters = async () => {
  try {
    // Try with unlock_date first (new schema), fall back to unlock_at (old schema)
    let result;
    try {
      result = await pool.query(
        `UPDATE letters 
         SET is_unlocked = TRUE, unlocked_at = NOW()
         WHERE unlock_type = 'date' 
           AND unlock_date <= NOW() 
           AND is_unlocked = FALSE
         RETURNING id, title, vault_id`
      );
    } catch (err) {
      // Try old schema column name
      result = await pool.query(
        `UPDATE letters 
         SET is_unlocked = TRUE, unlocked_at = NOW()
         WHERE unlock_type = 'date' 
           AND unlock_at <= NOW() 
           AND is_unlocked = FALSE
         RETURNING id, title, vault_id`
      );
    }

    if (result.rows.length > 0) {
      console.log(`📬 Auto-unlocked ${result.rows.length} letter(s)`);
      result.rows.forEach(letter => {
        console.log(`   - "${letter.title}" (ID: ${letter.id})`);
      });
    }

    return result.rows;
  } catch (error) {
    console.error('❌ Error checking letter unlocks:', error.message);
    return [];
  }
};

// Start scheduler (runs every minute)
const startScheduler = () => {
  console.log('⏰ Letter unlock scheduler started');
  
  // Run immediately on start
  checkAndUnlockLetters();
  
  // Then run every minute
  setInterval(checkAndUnlockLetters, 60 * 1000);
};

module.exports = { startScheduler, checkAndUnlockLetters };
