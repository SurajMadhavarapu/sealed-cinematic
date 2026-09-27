# Repository workflow

- The owner has requested that completed, tested changes be committed and pushed to this repository as part of future implementation tasks. This authorization continues unless the owner says otherwise.
- Review the diff, preserve unrelated work, run checks appropriate to the change, and push without force. Do not commit secrets or environment files.
- Report the pushed commit and distinguish repository updates from verified deployments. A push may trigger connected hosting deployments.
- Public frontend: https://sealed-cinematic.vercel.app
- The deployed frontend points to https://sealed-cinematic-server.onrender.com/api (observed 2026-09-27). The database uses Supabase's session pooler. Render attempts auto-deploys; verify the live commit after each push. See DEPLOYMENT.md for verified TLS and the required provider CA.
- For backend concurrency changes, run the PostgreSQL suite described in server/test/README.md; skipped integration tests are not evidence of passing database tests.
