const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Isolate controllers from database startup; never connect to a real user database.
function setup(results) {
  const calls = [];
  const context = {
    exports: {},
    require: (name) => {
      assert.equal(name, '../config/db');
      return { query: async (sql, params) => {
        calls.push({ sql, params });
        assert.ok(results.length, 'Unexpected database query');
        return { rows: results.shift() };
      } };
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../controllers/letterController.js'), 'utf8'), context);
  const res = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  const req = { params: { vaultId: '10', letterId: '20' }, user: { id: 1 }, body: { title: 'New title' } };
  return { controller: context.exports, calls, res, req, next: (error) => { throw error; } };
}
const sealed = { id: 20, vault_id: 10, author_id: 1, content: 'SECRET', is_unlocked: false, unlock_type: 'consensus' };

test('former members cannot edit or retrieve a letter through editing', async () => {
  const s = setup([[]]);
  await s.controller.updateLetter(s.req, s.res, s.next);
  assert.equal(s.res.code, 403);
  assert.equal(s.calls.length, 1);
});

test('another member cannot edit the author’s letter', async () => {
  const s = setup([[{ id: 1 }], [{ ...sealed, author_id: 2 }]]);
  await s.controller.updateLetter(s.req, s.res, s.next);
  assert.equal(s.res.code, 403);
  assert.equal(s.calls.length, 2);
});

test('title-only edit never returns stored sealed content', async () => {
  const s = setup([[{ id: 1 }], [sealed], [sealed]]);
  await s.controller.updateLetter(s.req, s.res, s.next);
  assert.equal(s.res.code, 200);
  assert.equal(s.res.body.data.letter.content, null);
  assert.ok(!JSON.stringify(s.res.body).includes('SECRET'));
  const write = s.calls[2].sql;
  assert.match(write, /is_unlocked = FALSE/);
  assert.match(write, /unlock_date > clock_timestamp\(\)/);
  assert.match(write, /EXISTS \(SELECT 1 FROM vault_members/);
});

test('a letter that becomes ineligible during an edit returns conflict', async () => {
  const s = setup([[{ id: 1 }], [sealed], []]);
  await s.controller.updateLetter(s.req, s.res, s.next);
  assert.equal(s.res.code, 409);
});

test('already unlocked letters cannot be edited', async () => {
  const s = setup([[{ id: 1 }], [{ ...sealed, is_unlocked: true }]]);
  await s.controller.updateLetter(s.req, s.res, s.next);
  assert.equal(s.res.code, 400);
});

for (const body of [{}, { content: null }, { title: ' ' }, { content: {} }, { title: 'x'.repeat(256) }]) {
  test(`invalid edit rejected: ${JSON.stringify(body)}`, async () => {
    const s = setup([[{ id: 1 }]]);
    s.req.body = body;
    await s.controller.updateLetter(s.req, s.res, s.next);
    assert.equal(s.res.code, 400);
    assert.equal(s.calls.length, 1);
  });
}

test('creation response does not echo sealed content', async () => {
  const s = setup([[{ id: 1 }], [sealed]]);
  s.req.body = { title: 'Test', content: 'SECRET', unlockType: 'consensus' };
  await s.controller.createLetter(s.req, s.res, s.next);
  assert.equal(s.res.code, 201);
  assert.equal(s.res.body.data.letter.content, null);
});

test('locked single-letter read hides content even from its author', async () => {
  const s = setup([[{ id: 1 }], [], [{ ...sealed }]]);
  await s.controller.getLetter(s.req, s.res, s.next);
  assert.equal(s.res.body.data.letter.content, null);
});

test('unlocked single-letter read returns content to a member', async () => {
  const s = setup([[{ id: 1 }], [], [{ ...sealed, is_unlocked: true }]]);
  await s.controller.getLetter(s.req, s.res, s.next);
  assert.equal(s.res.body.data.letter.content, 'SECRET');
});

for (const action of ['getLetters', 'getLetter', 'unlockLetter', 'deleteLetter', 'createLetter']) {
  test(`${action} rejects nonmembers before accessing letters`, async () => {
    const s = setup([[]]);
    await s.controller[action](s.req, s.res, s.next);
    assert.equal(s.res.code, 403);
    assert.equal(s.calls.length, 1);
  });
}
