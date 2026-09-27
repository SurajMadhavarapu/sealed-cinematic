# Render backend with Supabase Postgres

The frontend runs on Vercel. Its API is hosted on Render and connects to the Supabase session pooler on port 5432. Supabase hosting was identified from the hostname provided by the owner; database credentials were not accessed.

## Configuration

- Keep the complete `DATABASE_URL` in Render's environment settings. Never commit it or paste it into chat. Use the exact session-pooler URL from Supabase, including its full username.
- `DB_PRIVATE_NETWORK_ONLY` is obsolete and ignored. Do not set it to claim a public managed database is private.
- Database TLS verifies both certificate trust and hostname. `DATABASE_SSL_MODE` defaults to `verify-full`. Only explicitly configured localhost development connections can disable TLS.
- Set `DATABASE_SSL_CA` to the PEM CA certificate downloaded from your Supabase project's database SSL settings. Multiline PEM and literal `\n` separators are accepted. This is a public CA certificate, never a private key.
- Existing `sslmode=require` URL parameters are accepted but cannot downgrade certificate verification. Certificate paths in the URL are unsupported; use `DATABASE_SSL_CA`.
- Keep `NODE_ENV=production`, `CLIENT_URL=https://sealed-cinematic.vercel.app`, and HTTPS enforcement enabled. Preserve the existing JWT secret.

On 2026-09-27 a credential-free PostgreSQL TLS handshake to the supplied pooler hostname failed Node's default trust check with `SELF_SIGNED_CERT_IN_CHAIN`. A trusted provider-issued CA is therefore required for this connection. Do not obtain trust anchors by copying the certificate from an unverified connection, and do not use `rejectUnauthorized: false`.

Download the certificate from Supabase's authenticated dashboard, as described in [Supabase's connection guide](https://supabase.com/docs/guides/database/connecting-to-postgres). Add it to Render's Environment settings and redeploy the latest commit. Startup checks database connectivity before opening the HTTP port, so invalid TLS or credentials cannot produce a misleading healthy new deployment.

## Verification

Check the deployed commit in Render, successful startup, and `/api/health`. Then test login with your existing account. The startup query verifies database connectivity, not every application table or migration. No database schema change is required for this fix.

Configuration and startup regression tests run with `node --test server/test/database-options.test.js server/test/startup.test.js` from the repository root. No production credentials are used by these tests.

See [node-postgres SSL documentation](https://node-postgres.com/features/ssl) for why SSL parameters in connection strings can overwrite driver SSL options. This application constructs explicit connection fields to prevent that override.
