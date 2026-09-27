# Encryption and recovery design

Status: recovery policy selected by the owner; browser encryption primitives implemented and isolated from the live app. The full key-sharing protocol, account recovery, and data migration are not implemented. Existing letters remain plaintext.

## User-facing decisions

- The owner selected a recovery code saved by the user. SEALED will not hold a master decryption key.
- Restoring account access and restoring encrypted letters are separate operations. Email password reset alone cannot decrypt old letters.
- Without the recovery code or another device with usable keys, a user's private encryption identity cannot be recovered by SEALED. A recipient may still retain a copy of a shared letter; that is not recovery of the lost identity.
- A new device must restore keys before it can read encrypted letters. Do not generate replacement keys silently when restoration fails.
- Encryption protects content confidentiality. Dates and votes remain application access rules, not a cryptographic time-lock. Authors can keep drafts or keys. A compromised server could release ciphertext and wrapped keys early to intended recipients.

## Intended threat model

The target is protection of new encrypted letter bodies against database/backups disclosure and passive server-side access. Account IDs, vault membership, titles, unlock conditions, voting activity, timestamps, and approximate content sizes remain visible in the first proposed release. Titles must be labelled as visible metadata in the composer.

Browser-delivered code still depends on a trusted application deployment. Malicious JavaScript, XSS, compromised devices, and recipients copying plaintext are outside this protection. Standard browser encryption alone does not solve malicious public-key substitution or long-term post-quantum security. Do not market this as zero-knowledge or permanently unreadable to any possible operator attack.

## Implemented foundation

`client/src/lib/crypto/envelope.ts` uses Web Crypto AES-256-GCM with a fresh random 96-bit IV and 128-bit authentication tag. Its versioned envelope contains only IV and ciphertext/tag. Authenticated context binds the envelope to a caller-supplied record identity and format version. The caller must reconstruct the expected identity from trusted state; copying context supplied by an attacker defeats that binding.

Inputs have encoding and size checks. Random recovery codes contain 256 bits of entropy and import as non-extractable AES keys. These codes are intended to encrypt a private-key backup, not authenticate API requests or directly encrypt every letter. Wrong codes must fail decryption, never create an empty vault.

The helper has no network or storage operations and is not imported by any page or API. `generateEncryptionKey` returns a memory-only non-extractable test key; it is not yet a persisted or shareable letter-key implementation. Secret byte buffers are cleared where practical, but JavaScript strings and runtime copies cannot be guaranteed erased.

The tests exercise the exact TypeScript module using Node Web Crypto. They are not browser compatibility tests or a cryptographic audit.

## Proposed key and letter flow

1. Create a per-user encryption identity in the browser. Select a reviewed public-key wrapping implementation after browser compatibility checks; RSA-OAEP/SHA-256 is a Web Crypto candidate, not a completed protocol choice. Keep versioned key IDs so upgrades are possible. No custom ciphers or ad-hoc key-exchange protocol.
2. Encrypt the private-key backup with the user's recovery secret, bound to user ID and key ID. Upload only the encrypted backup and public key. Require the user to confirm their saved recovery code before activating encryption.
3. For the initial prototype, import the recovery code on a new session and keep restored private keys in memory. Do not put recovery codes or raw private keys in localStorage, URLs, logs, analytics, or email. Persistent trusted-device storage needs a separate design and browser tests.
4. Create a fresh data key per letter revision. Encrypt the body in the browser and wrap that key separately for every intended recipient, including the author. Bind vault ID, a client-generated unique letter ID, revision, and protocol version into authenticated data. Signature/identity verification must be designed before accepting envelopes as proof of authorship: AES-GCM alone does not distinguish recipients who share a key.
5. Upload ciphertext and recipient key envelopes atomically. The server verifies current membership, recipient coverage, key IDs, version, and size without receiving plaintext or raw keys. All recipients must have verified encryption identities before creating an encrypted letter.
6. Keep the existing membership and unlock checks. Before unlock, omit body ciphertext and wrapped letter keys from all read and mutation responses. After unlock, send only the requesting member's envelope. The browser unwraps and decrypts locally.
7. Pin public-key fingerprints on trusted devices and provide member fingerprint verification. A changed key requires explicit re-verification, never automatic trust. Define signed recipient manifests and historical key handling before enabling writes.

No login-password-derived encryption key: the current login password is sent to Express for bcrypt verification. Reusing it as the sole encryption secret would let that server derive the user's keys. The chosen recovery secret remains separate from login credentials.

## Membership and unlock semantics needing implementation

Today a join grants access to earlier unlocked letters. Per-recipient encryption cannot preserve immediate historical access unless an existing authorized device shares the relevant keys. Proposed UI: joining succeeds, but older encrypted letters show **Waiting for key sharing** until a trusted member explicitly grants access. Locked historical letters require a defined author-mediated sharing policy; never bypass the unlock rule by exporting keys through a sharing endpoint.

This proposed behavior change is not activated by this commit. Agree on historical sharing before implementing the recipient API. Membership/public-key changes during composition require a transactional version check and client retry. Keep vault-then-letter locking consistent with the consensus implementation.

Removing a member cannot erase keys or plaintext they already received. Rotate keys for future content; do not claim retroactive revocation. Key loss/replacement must preserve old envelopes until their migration is complete. Recovery-code rotation must retain access to historical private keys; it cannot revoke a previously stolen recovery code plus backup.

## Account recovery implementation contract

- Add verified email ownership and an email delivery provider before password reset is released.
- Use generic responses for reset requests; rate-limit request and redemption endpoints. Do not reveal account existence.
- Generate a high-entropy, expiring, single-use reset token. Store only its hash. Use a configured trusted frontend URL; do not construct links from the incoming Host header.
- Redeem tokens atomically with the password update and session invalidation. Introduce revocable sessions or a checked token version; the current JWT-only model does not revoke existing sessions on reset.
- Do not automatically log the user in after reset. Notify the account owner. Do not log reset tokens.
- Password reset must leave public keys, private-key backups, and encrypted letters unchanged. Then offer local recovery-code import. Never ask users to send their recovery code to support.
- Session hardening must account for Vercel and Render being on different sites. Choose a same-origin API proxy or a custom-domain cookie design with CSRF protection before replacing localStorage tokens.

## Rollout and legacy data

1. Keep this foundation disconnected while key sharing, sessions, and recovery UI are built and tested.
2. Add a versioned schema migration: separate plaintext legacy content from ciphertext, recipient envelopes, and encrypted identity backups. Do not place ciphertext in an untyped legacy `content` field or silently downgrade on errors.
3. Deploy backward-compatible backend support first. Verify the actual Render revision and database schema before enabling the frontend feature flag.
4. Test two independent users/devices, recovery from a fresh browser, lost recovery, tampering, wrong recipient, forged metadata, key replacement, membership races, and restart/restore scenarios using fictional content. Verify captured API requests contain no plaintext or recovery secret.
5. Migrate legacy letters only through a defined, authorized browser workflow. Currently locked letters cannot be fetched for migration without changing the access promise; keep them explicitly labelled legacy until an approved migration or normal unlock. Never delete existing plaintext merely because ciphertext was uploaded—verify recovery and readback first.
6. Remove migrated plaintext after verification, and document backup retention. Encryption cannot retroactively erase old database backups or logs.
7. Enable for a controlled test vault, then expand after recovery and restore checks. Rollback must retain ciphertext and keys even if the feature is disabled.

## Next implementation slice

Implement encryption identity setup and recovery-code confirmation using the selected recovery policy. Before live integration, finalize the reviewed recipient-wrapping/identity verification approach and historical-sharing behavior. Account email recovery also needs provider configuration; no account-reset endpoint should ship as a nonfunctional placeholder.

## References

- [OWASP Cryptographic Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html): threat modelling, authenticated encryption, random generation, and avoidance of custom cryptography.
- [OWASP Key Management](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html): key lifecycle, backup, recovery, and compromise planning.
- [OWASP Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html): reset-token handling and account-recovery protections.
- [W3C Web Cryptography](https://www.w3.org/TR/webcrypto/): browser cryptographic operations. Level 2 is a draft; the foundation uses established AES-GCM operations, not new draft-only algorithms.
