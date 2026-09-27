# Letter privacy review — 2026-09-27

Status: initial source review, targeted letter fixes, and invite/consensus hardening complete. Not a production security certification. Use fictional test data only.

## How letters work today

- The browser sends readable titles and content to Express. `createLetter` writes them directly to PostgreSQL. The encryption helper is not part of this flow.
- Anyone with sufficient server/database access, including access to backups, can read locked letters. An application unlock rule is not cryptographic protection.
- Letter routes require a JWT. Reads require current vault membership and match the letter to the requested vault. Locked reads hide content, including from the author; titles and author information remain visible to members.
- All current vault members can read unlocked letters. Joining a vault also grants access to its earlier unlocked letters. There is no per-letter recipient list.
- Date unlocking uses server/database time. Both reads and the background scheduler update eligible letters. Consensus unlocking counts votes.
- The author can delete their letters, including unlocked ones. The implementation does not enforce group consent for deletion despite the README's general consensus promise.

## Fixed in this pass

- Editing now checks vault membership before looking up the letter.
- Creation and editing responses hide content. Previously an author could send a title-only edit and retrieve the original sealed text from `RETURNING *`.
- Editing rejects empty/invalid fields. Its SQL write rechecks author, vault, membership, locked state, and date eligibility, preventing edits after unlocking or after the date has passed even if the scheduler has not run.
- Removed letter titles from scheduler logs.
- Corrected encryption claims in the README, schema comment, page metadata, homepage, terms, and privacy page. No encryption or data migration was introduced.

## Remaining launch blockers, in recommended order

1. **Membership and consensus transactions — fixed.** Invite credentials are omitted from vault responses. Redemption validates expiry after acquiring a vault row lock and inserts membership/consumes the code in one transaction. Consensus voting locks the same vault row, then the letter, counts only current members, and commits the vote and unlock together. Actual PostgreSQL tests cover competing joins, votes, failures, and both join/approval orderings. Future membership-removal/account-deletion endpoints must follow this locking protocol.
2. **Decide and implement the encryption/recovery model.** For end-to-end encryption, design client-held keys, member key sharing, new-device access, recovery, and access for future members. Decide who can decrypt before the unlock date and what server compromise should allow. Encrypting only on the server does not fulfill the end-to-end promise. Validate the design before migrating existing data; include backup/key recovery tests.
3. **Database transport and deployment trust.** `config/db.js` disables TLS certificate verification. Configure certificate validation for the selected host. `DB_PRIVATE_NETWORK_ONLY` is an assertion, not a firewall. Configure actual network rules. IP rate limits currently trust the first raw forwarded header; align proxy trust and rate-limit IP handling with deployment.
4. **Sessions and account recovery.** JWTs are stored in browser localStorage and there is no implemented recovery/revocation workflow. Review session handling, password policy, recovery, and XSS exposure together with the encryption design.
5. **Time and lifecycle consistency.** Schema dates use timestamps without time zones. Standardize UTC handling and use a migration for existing installations. Define deletion/ownership policy and test restore, expiration, scheduler downtime, and account deletion consequences.

Additional disclosure check: the AI endpoint sends supplied mood/context to Groq when configured. Never send letter bodies implicitly; disclose this external processing before real-user use. Homepage delivery/offline/comparison claims also need a broader product accuracy review.

## Validation

- `cd server; npm test`: 18 controller regression tests passed, using an isolated simulated database. Covers membership denial, unauthorized editing, hidden sealed content, invalid edits, and write-conflict handling.
- The tests check SQL guards but do not execute them against PostgreSQL or prove concurrency behavior.
- `cd client; npx tsc --noEmit --incremental false`: passed.
- No live database data was read or changed. No deployment performed. Existing uncommitted work was preserved.

## Step two validation

- Full server suite: **31 passed, 0 skipped**, including 13 integration cases against isolated PostgreSQL 16.14.
- Tests exercise real SQL and competing connections with observed database lock waits. They invoke controllers directly; HTTP routing/JWT integration is not included.
- Verified credentials stay out of vault responses, one invite admits one new member, expired codes fail, old nonmember votes do not count, simultaneous approvals unlock once, and failed writes roll back.
- Join first: the new member must vote before unlock. Approval first: the unlock stays permanent; a subsequent join does not reseal it. This preserves existing access to earlier unlocked letters for new members.
- Test PostgreSQL ran locally using temporary binaries outside the repository. No application database was accessed, no application dependency was added, and no deployment was performed.
- See server/test/README.md for repeatable test instructions.

Next bounded step: design encryption and account recovery before implementation. Server/database operators can still read stored letters.
