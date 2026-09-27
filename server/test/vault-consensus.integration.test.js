const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { Pool } = require('pg');
const transaction = require('../utils/transaction');

// Explicit test URL only. A unique schema isolates tests from existing tables.
const url = process.env.TEST_DATABASE_URL;
const integration = (name, fn) => test(name, { skip: !url }, fn);
const schema = `sealed_test_${crypto.randomBytes(8).toString('hex')}`;
let admin, pool;
before(async () => {
  if (!url) return;
  admin = new Pool({ connectionString: url });
  await admin.query(`CREATE SCHEMA ${schema}`);
  pool = new Pool({ connectionString: url, max: 8,
    application_name: schema, options: `-c search_path=${schema} -c timezone=UTC -c statement_timeout=10000` });
  await pool.query(fs.readFileSync(path.join(__dirname, '../config/schema.sql'), 'utf8'));
});
after(async () => {
  if (pool) await pool.end();
  if (admin) {
    await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await admin.end();
  }
});
beforeEach(async () => {
  if (!pool) return;
  await pool.query('TRUNCATE votes, letters, vault_members, vaults, users RESTART IDENTITY CASCADE');
  await pool.query(`INSERT INTO users (email,password,name) VALUES
    ('one@test','fake','One'), ('two@test','fake','Two'), ('three@test','fake','Three'), ('four@test','fake','Four');
    INSERT INTO vaults (name,created_by,invite_code,invite_expires_at)
    VALUES ('Test',1,'ABCDEF123456',clock_timestamp() + interval '1 hour');
    INSERT INTO vault_members (vault_id,user_id,role) VALUES (1,1,'owner'),(1,2,'member');
    INSERT INTO letters (vault_id,author_id,title,content,unlock_type)
    VALUES (1,1,'Test','Fictional test content','consensus');`);
});

function controller(name, hook) {
  const db = hook ? {
    query: pool.query.bind(pool),
    connect: async () => {
      const client = await pool.connect();
      return { release: () => client.release(), query: async (sql, params) => {
        const result = await client.query(sql, params);
        await hook(sql, params, result);
        return result;
      } };
    },
  } : pool;
  const context = { exports: {}, require: (name) => {
    if (name === '../config/db') return db;
    if (name === '../utils/transaction') return transaction;
    if (name === 'crypto') return crypto;
    throw new Error(`Unexpected module ${name}`);
  } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, `../controllers/${name}Controller.js`), 'utf8'), context);
  return context.exports;
}
async function call(handler, userId, body = {}, params = {}) {
  const response = { statusCode: 200, status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; } };
  await handler({ user: { id: userId }, body, params: { vaultId: '1', letterId: '1', ...params } },
    response, error => { throw error; });
  return response;
}
const join = (handler, user) => call(handler, user, { inviteCode: 'ABCDEF123456' });
const vote = (handler, user, value = 'yes') => call(handler, user, { vote: value });
const state = async () => (await pool.query('SELECT is_unlocked FROM letters WHERE id=1')).rows[0].is_unlocked;
function gate() {
  let release, entered;
  const ready = new Promise(resolve => { entered = resolve; });
  const wait = new Promise(resolve => { release = resolve; });
  return { ready, release, hold: async () => { entered(); await wait; } };
}
async function waitForBlockedQuery() {
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    const result = await admin.query(
      "SELECT 1 FROM pg_stat_activity WHERE application_name=$1 AND wait_event_type='Lock'", [schema]);
    if (result.rows.length) return;
    await new Promise(resolve => setTimeout(resolve, 15));
  }
  throw new Error('Expected competing request to wait for a database lock');
}

integration('vault list/detail/join never expose invite credentials', async () => {
  const c = controller('vault');
  for (const response of [await call(c.getMyVaults, 2), await call(c.getVault, 2), await join(c.joinVault, 3)]) {
    assert.equal(response.statusCode, 200);
    assert.ok(!JSON.stringify(response.body).includes('invite_code'));
    assert.ok(!JSON.stringify(response.body).includes('invite_expires_at'));
    assert.ok(!JSON.stringify(response.body).includes('ABCDEF123456'));
  }
});
integration('only owner can generate invite credentials', async () => {
  const c = controller('vault');
  assert.equal((await call(c.generateInvite, 2)).statusCode, 403);
  assert.equal((await call(c.generateInvite, 3)).statusCode, 403);
  const result = await call(c.generateInvite, 1);
  assert.equal(result.statusCode, 200);
  assert.match(result.body.data.inviteCode, /^[A-F0-9]{12}$/);
});
integration('two simultaneous redemptions admit exactly one person', async () => {
  const c = controller('vault');
  const results = await Promise.all([join(c.joinVault, 3), join(c.joinVault, 4)]);
  assert.deepEqual(results.map(r => r.statusCode).sort(), [200, 400]);
  assert.equal((await pool.query('SELECT COUNT(*)::int AS count FROM vault_members')).rows[0].count, 3);
  assert.equal((await pool.query('SELECT invite_code FROM vaults')).rows[0].invite_code, null);
});
integration('invalid, expired, and existing-member attempts preserve membership', async () => {
  const c = controller('vault');
  assert.equal((await join(c.joinVault, 1)).statusCode, 400);
  assert.equal((await call(c.joinVault, 3, { inviteCode: {} })).statusCode, 400);
  await pool.query("UPDATE vaults SET invite_expires_at = clock_timestamp() - interval '1 second'");
  assert.equal((await join(c.joinVault, 3)).statusCode, 400);
  assert.equal((await pool.query('SELECT COUNT(*)::int AS count FROM vault_members')).rows[0].count, 2);
});
integration('failed invite consumption rolls back inserted membership', async () => {
  const c = controller('vault', async sql => {
    if (sql.startsWith('UPDATE vaults SET invite_code = NULL')) throw new Error('Injected failure');
  });
  await assert.rejects(join(c.joinVault, 3), /Injected failure/);
  assert.equal((await pool.query('SELECT COUNT(*)::int AS count FROM vault_members')).rows[0].count, 2);
  assert.equal((await pool.query('SELECT invite_code FROM vaults')).rows[0].invite_code, 'ABCDEF123456');
});
integration('only current members count toward unanimity and vote summaries', async () => {
  await pool.query("INSERT INTO votes(letter_id,user_id,vote) VALUES (1,3,'yes')");
  const c = controller('vote');
  const result = await vote(c.castVote, 1);
  assert.equal(result.body.data.yesVotes, 1);
  assert.equal(await state(), false);
  const summary = await call(c.getVotes, 1);
  assert.equal(summary.body.data.summary.yes, 1);
  assert.equal(summary.body.data.summary.required, 2);
  assert.equal((await vote(c.castVote, 2)).body.data.unlocked, true);
});
integration('nonmembers and cross-vault letter requests cannot vote', async () => {
  const c = controller('vote');
  assert.equal((await vote(c.castVote, 3)).statusCode, 403);
  await pool.query("INSERT INTO vaults(name,created_by) VALUES ('Other',1)");
  await pool.query("INSERT INTO letters(vault_id,author_id,title,content,unlock_type) VALUES(2,1,'Other','Test','consensus')");
  assert.equal((await call(c.castVote, 1, { vote: 'yes' }, { letterId: '2' })).statusCode, 404);
  assert.equal((await pool.query('SELECT COUNT(*)::int AS count FROM votes')).rows[0].count, 0);
});
integration('simultaneous final approvals unlock exactly once', async () => {
  const c = controller('vote');
  const results = await Promise.all([vote(c.castVote, 1), vote(c.castVote, 2)]);
  assert.ok(results.every(r => r.statusCode === 200));
  assert.equal(results.filter(r => r.body.data.unlocked).length, 1);
  assert.equal(await state(), true);
  assert.equal((await vote(c.castVote, 1, 'no')).statusCode, 400);
});
integration('a join committed before final approval is included in consensus', async () => {
  await vote(controller('vote').castVote, 1);
  const barrier = gate();
  const joining = controller('vault', async sql => {
    if (sql.includes('WHERE invite_code = $1 FOR UPDATE')) await barrier.hold();
  });
  const first = join(joining.joinVault, 3);
  await barrier.ready;
  const second = vote(controller('vote').castVote, 2);
  try { await waitForBlockedQuery(); } finally { barrier.release(); }
  const results = await Promise.all([first, second]);
  assert.equal(results[1].body.data.totalMembers, 3);
  assert.equal(results[1].body.data.unlocked, false);
  assert.equal(await state(), false);
});
integration('a no vote committed before final approval prevents unlocking', async () => {
  await vote(controller('vote').castVote, 1);
  const barrier = gate();
  const changing = controller('vote', async sql => {
    if (sql === 'SELECT id FROM vaults WHERE id = $1 FOR UPDATE') await barrier.hold();
  });
  const first = vote(changing.castVote, 1, 'no');
  await barrier.ready;
  const second = vote(controller('vote').castVote, 2);
  try { await waitForBlockedQuery(); } finally { barrier.release(); }
  await Promise.all([first, second]);
  assert.equal(await state(), false);
});
integration('failed unlocking rolls back final vote and letter state', async () => {
  await vote(controller('vote').castVote, 1);
  const c = controller('vote', async sql => {
    if (sql.startsWith('UPDATE letters SET is_unlocked')) throw new Error('Injected failure');
  });
  await assert.rejects(vote(c.castVote, 2), /Injected failure/);
  assert.equal(await state(), false);
  assert.equal((await pool.query('SELECT COUNT(*)::int AS count FROM votes')).rows[0].count, 1);
});

integration('completed consensus remains unlocked when a join and vote change follow', async () => {
  await vote(controller('vote').castVote, 1);
  const barrier = gate();
  const approving = controller('vote', async sql => {
    if (sql === 'SELECT id FROM vaults WHERE id = $1 FOR UPDATE') await barrier.hold();
  });
  const first = vote(approving.castVote, 2);
  await barrier.ready;
  const changing = vote(controller('vote').castVote, 1, 'no');
  const joining = join(controller('vault').joinVault, 3);
  try { await waitForBlockedQuery(); } finally { barrier.release(); }
  const results = await Promise.all([first, changing, joining]);
  assert.equal(results[0].body.data.unlocked, true);
  assert.equal(results[1].statusCode, 400);
  assert.equal(results[2].statusCode, 200);
  assert.equal(await state(), true);
  assert.equal((await pool.query('SELECT vote FROM votes WHERE user_id=1')).rows[0].vote, 'yes');
});

integration('invite expiry is checked again after waiting for a lock', async () => {
  const blocker = await pool.connect();
  let pending;
  try {
    await blocker.query('BEGIN');
    await blocker.query('SELECT id FROM vaults WHERE id=1 FOR UPDATE');
    pending = join(controller('vault').joinVault, 3);
    await waitForBlockedQuery();
    await blocker.query("UPDATE vaults SET invite_expires_at = clock_timestamp() - interval '1 second' WHERE id=1");
    await blocker.query('COMMIT');
    assert.equal((await pending).statusCode, 400);
    assert.equal((await pool.query('SELECT COUNT(*)::int AS count FROM vault_members')).rows[0].count, 2);
  } finally {
    await blocker.query('ROLLBACK');
    blocker.release();
    if (pending) await pending;
  }
});
