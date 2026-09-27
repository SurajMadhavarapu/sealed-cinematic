// All membership changes and consensus decisions lock the vault row first,
// then the letter row (if any). Keep that order in future membership endpoints.
module.exports = async function transaction(pool, work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL READ COMMITTED');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch { /* Preserve original error. */ }
    throw error;
  } finally {
    client.release();
  }
};
