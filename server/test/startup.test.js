const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

async function startup(fail) {
  const events = [];
  const app = { set() {}, use() {}, get() {}, listen(port, callback) { events.push('listen'); callback(); } };
  const express = Object.assign(() => app, { json() {} });
  const context = { process: { env: {}, exitCode: 0 }, console: { log() {}, error() {} }, require(name) {
    if (name === 'dotenv') return { config() {} };
    if (name === 'express') return express;
    if (name === 'cors') return () => {};
    if (name === './config/validateEnv') return () => { events.push('validate'); };
    if (name === './config/db') return {
      query: async () => { events.push('query'); if (fail) throw new Error('connection failed'); },
      end: async () => { events.push('end'); },
    };
    if (name === './services/schedulerService') return { startScheduler() { events.push('scheduler'); } };
    return {};
  } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../index'), 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  return { events, exitCode: context.process.exitCode };
}
test('database check completes before listening or scheduling', async () => {
  const result = await startup(false);
  assert.deepEqual(result.events, ['validate', 'query', 'listen', 'scheduler']);
});
test('failed database connection prevents unhealthy deployment from listening', async () => {
  const result = await startup(true);
  assert.deepEqual(result.events, ['validate', 'query', 'end']);
  assert.equal(result.exitCode, 1);
});
