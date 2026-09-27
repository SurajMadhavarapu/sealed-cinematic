import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { webcrypto } from 'node:crypto';

// Exercise the exact browser source with Node's standards-compatible Web Crypto.
if (!globalThis.crypto) Object.defineProperty(globalThis, 'crypto', { value: webcrypto });
const source = fs.readFileSync(new URL('../src/lib/crypto/envelope.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
});
const { encryptText, decryptText, generateEncryptionKey, generateRecoveryCode, importRecoveryCode } =
  await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const context = 'letter:example-vault:example-letter:revision-1';

test('Unicode plaintext survives encrypted round trip and serialization', async () => {
  const key = await generateEncryptionKey();
  const text = 'For later 💌 — తెలుగు';
  const envelope = await encryptText(key, text, context);
  assert.equal(await decryptText(key, JSON.parse(JSON.stringify(envelope)), context), text);
  assert.ok(!JSON.stringify(envelope).includes(text));
  assert.equal(key.extractable, false);
});
test('repeated encryption uses different IVs and ciphertexts', async () => {
  const key = await generateEncryptionKey();
  const one = await encryptText(key, 'Same letter', context);
  const two = await encryptText(key, 'Same letter', context);
  assert.notEqual(one.iv, two.iv);
  assert.notEqual(one.ciphertext, two.ciphertext);
});
test('wrong key and wrong record identity fail authentication', async () => {
  const key = await generateEncryptionKey();
  const envelope = await encryptText(key, 'Test', context);
  await assert.rejects(decryptText(await generateEncryptionKey(), envelope, context));
  await assert.rejects(decryptText(key, envelope, 'letter:another-vault:example-letter:revision-1'));
});
test('changed ciphertext, tag, and IV fail authentication', async () => {
  const key = await generateEncryptionKey();
  const envelope = await encryptText(key, 'Test content', context);
  for (const [field, index] of [['ciphertext', 0], ['ciphertext', -1], ['iv', 0]]) {
    const bytes = Buffer.from(envelope[field], 'base64url');
    bytes[index < 0 ? bytes.length + index : index] ^= 1;
    await assert.rejects(decryptText(key, { ...envelope, [field]: bytes.toString('base64url') }, context));
  }
});
test('unknown format, invalid lengths, and malformed encodings are rejected', async () => {
  const key = await generateEncryptionKey();
  const envelope = await encryptText(key, 'Test', context);
  for (const change of [{ version: 2 }, { algorithm: 'AES-CBC' }, { iv: 'AA' },
    { ciphertext: 'AA' }, { ciphertext: '***' }, { ciphertext: 'A'.repeat(100000) }]) {
    await assert.rejects(decryptText(key, { ...envelope, ...change }, context));
  }
});
test('UTF-8 byte limit is enforced and empty context is rejected', async () => {
  const key = await generateEncryptionKey();
  await assert.rejects(encryptText(key, '💌'.repeat(20000), context), /too large/);
  await assert.rejects(encryptText(key, 'Test', ''), /context/);
});
test('saved recovery code restores a key-backup envelope on a fresh import', async () => {
  const code = await generateRecoveryCode();
  const key = await importRecoveryCode(code);
  const backup = await encryptText(key, 'fictional private-key backup', 'key-backup:user-1:key-1');
  const restored = await importRecoveryCode(code);
  assert.equal(await decryptText(restored, backup, 'key-backup:user-1:key-1'), 'fictional private-key backup');
  assert.equal(restored.extractable, false);
  const wrong = await importRecoveryCode(await generateRecoveryCode());
  await assert.rejects(decryptText(wrong, backup, 'key-backup:user-1:key-1'));
});
test('malformed recovery codes fail closed', async () => {
  for (const code of ['', 'password', 'SEALED-R1-AA', `SEALED-R1-${'A'.repeat(44)}`]) {
    await assert.rejects(importRecoveryCode(code));
  }
});
