# Server tests

Run `npm test` from `server` for controller regression tests. PostgreSQL tests are
explicitly skipped unless `TEST_DATABASE_URL` is set.

To run the full suite in PowerShell against a disposable local PostgreSQL instance:

```powershell
$env:TEST_DATABASE_URL = 'postgresql://TEST_USER:TEST_PASSWORD@127.0.0.1:5432/TEST_DATABASE'
npm test
```

Use a test database. The runner creates a random `sealed_test_*` schema, sets its
connection search path to that schema, and drops only that schema afterward. It
does not load the application's `.env` or use `DATABASE_URL`. The test account
needs permission to create schemas and see its own sessions in `pg_stat_activity`.

Concurrency tests use separate PostgreSQL connections and observe actual lock
waits before releasing competing requests. They cover single-use invites, expiry,
owner-only generation, response redaction, current-member vote counting, both
join/approval orders, vote changes, and transaction rollback. Controller handlers
run directly with a real database; HTTP routing and JWT middleware are not covered
by this integration suite.

Membership changes must lock the vault row before modifying membership. Consensus
voting locks the vault, then the letter. Future member removal and account deletion
flows must follow the same ordering. A completed unlock is permanent; a later join
does not reseal old letters, and later votes on an unlocked letter are rejected.
