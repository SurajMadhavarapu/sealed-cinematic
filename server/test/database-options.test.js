const test = require('node:test');
const assert = require('node:assert/strict');
const { Client } = require('pg');
const options = require('../config/databaseOptions');
const base = { NODE_ENV: 'production', DATABASE_URL: 'postgresql://postgres.example:test%40password@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres' };

test('Supabase pooler uses verified TLS without private-network flag', () => {
  const result = options(base);
  assert.equal(result.ssl.rejectUnauthorized, true);
  assert.equal(result.host, 'aws-1-ap-northeast-2.pooler.supabase.com');
  assert.equal(result.user, 'postgres.example');
  assert.equal(result.password, 'test@password');
  assert.equal(new Client(result).connectionParameters.ssl.rejectUnauthorized, true);
});
for (const query of ['sslmode=require', 'sslmode=verify-full', 'ssl=true']) {
  test(`${query} cannot override verified TLS`, () => {
    const result = options({ ...base, DATABASE_URL: `${base.DATABASE_URL}?${query}` });
    assert.equal(new Client(result).connectionParameters.ssl.rejectUnauthorized, true);
  });
}
test('remote plaintext and URL overrides are rejected', () => {
  for (const query of ['sslmode=disable', 'ssl=false', 'host=localhost', 'sslrootcert=secret.pem']) {
    assert.throws(() => options({ ...base, DATABASE_URL: `${base.DATABASE_URL}?${query}` }));
  }
  assert.throws(() => options({ ...base, DATABASE_SSL_MODE: 'disable' }));
});
test('plaintext requires explicit local nonproduction configuration', () => {
  const env = { DATABASE_URL: 'postgresql://test:test@localhost/test', DATABASE_SSL_MODE: 'disable', NODE_ENV: 'development' };
  assert.equal(options(env).ssl, false);
  assert.throws(() => options({ ...env, NODE_ENV: 'production' }));
});
test('malformed URLs and certificates give errors without leaking credentials', () => {
  for (const url of ['postgresql://', 'https://test:test@example.com/db', 'postgresql://test:secret@example.com']) {
    assert.throws(() => options({ ...base, DATABASE_URL: url }), error => !error.message.includes('secret'));
  }
  assert.throws(() => options({ ...base, DATABASE_SSL_CA: 'invalid' }), /PEM CA/);
});
test('production startup no longer requires a private network assertion', () => {
  const fs = require('node:fs');
  const vm = require('node:vm');
  const context = { module: { exports: {} }, process: { env: { ...base, JWT_SECRET: 'a'.repeat(40), DB_PRIVATE_NETWORK_ONLY: 'false' } } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../config/validateEnv'), 'utf8'), context);
  assert.doesNotThrow(() => context.module.exports());
  context.process.env.ENFORCE_HTTPS = 'false';
  assert.throws(() => context.module.exports(), /HTTPS/);
});
test('provider CA supports multiline PEM and escaped newlines without driver overrides', () => {
  const ca = require('node:tls').rootCertificates[0];
  for (const value of [ca, ca.replace(/\n/g, '\\n')]) {
    const result = options({ ...base, DATABASE_URL: `${base.DATABASE_URL}?sslmode=require`, DATABASE_SSL_CA: value });
    const ssl = new Client(result).connectionParameters.ssl;
    assert.equal(ssl.ca, ca);
    assert.equal(ssl.rejectUnauthorized, true);
  }
});
