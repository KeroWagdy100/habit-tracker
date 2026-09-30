# Daily Practice — Habit Tracker

A simple Arabic RTL habit tracker for students.

- **Frontend:** Vanilla HTML, CSS, and JavaScript
- **Backend:** Cloudflare Pages Functions
- **Database:** Neon PostgreSQL
- **Hosting:** Cloudflare Pages

The Pages Functions live under `functions/` and provide `/api/register`, `/api/login`, `/api/logout`, `/api/tracks`, and `/api/admin/tracks`. Admin history is requested with the `studentId` query parameter. The functions use the authenticated server-side session to determine identity and ownership.

## Database

The existing Neon database is retained. The current schema uses `users`, `tracks`, and `sessions`; tracks contain `prayer`, `read_bible`, `verse`, and `reflection`, with one track per student per date. Existing users and tracks are not recreated by this project. `schema.sql` is only for a new empty database. The historical migration is documented in [`migrations/20260930_habit_fields.sql`](migrations/20260930_habit_fields.sql); it is not needed for the already-migrated production database.

The additive [`migrations/20260930_enable_pgcrypto.sql`](migrations/20260930_enable_pgcrypto.sql) enables PostgreSQL's `pgcrypto` extension. It does not alter application rows. This is required for login/registration: Neon performs bcrypt password hashing and verification in the database, keeping CPU-heavy password work outside Cloudflare's 10 ms Free Worker CPU allowance. This migration has been applied to production.

## Local setup

1. Install Node.js and npm, then run `npm install`.
2. Copy `.dev.vars.example` to `.dev.vars` and set `DATABASE_URL` to the Neon connection string for the branch you want to use locally. Use a development/test branch while testing. `.dev.vars` is ignored by Git.
3. Start Cloudflare Pages locally with `npm run dev`, then open the Wrangler URL (normally `http://localhost:8788`). This serves the static pages and runs Pages Functions from `functions/`.

Only `DATABASE_URL` is required. There is no separate session secret: tokens are generated with Cloudflare's cryptographic API and stored in the existing PostgreSQL `sessions` table. The browser receives the session only as a `Secure`, `HttpOnly`, `SameSite=Lax` cookie. Password hashes use PostgreSQL's bcrypt-compatible `pgcrypto` functions; existing bcryptjs hashes remain valid. Do not expose `DATABASE_URL` in frontend files.

## Admin account

Registration always creates a student and rejects any submitted role. To promote an existing account, run this statement in the Neon SQL Editor:

```sql
UPDATE users SET role = 'admin' WHERE username = 'your-admin-username';
```

## Deploy to Cloudflare Pages

1. Push the project to GitHub and create a Pages project in Cloudflare using **Workers & Pages → Create → Pages → Connect to Git**. Select the repository and production branch.
2. Set the root directory to the repository root and the framework preset to **None**. Leave the build command blank and set the build output directory to `.`. `wrangler.toml` records the Pages output directory and compatibility date.
3. In the Pages project's **Settings → Variables and Secrets**, add `DATABASE_URL` as an encrypted secret for the production environment. Use the existing production Neon branch connection string. If you enable preview deployments, configure a separate test-branch value for Preview; avoid pointing previews at production.
4. Deploy. Pages detects the root `functions/` directory and installs its routes alongside the static site. Subsequent pushes to the connected branch deploy automatically.
5. Test registration, login, save/update, history, admin access, and logout on the Cloudflare URL. The production data remains in Neon.

You can also deploy manually after authenticating Wrangler with Cloudflare using `npm run deploy`. For Git-connected deployment, use the Pages dashboard workflow above.

Cloudflare Pages static asset requests are free and Pages Functions use the Workers Free request quota (currently 100,000 requests per day). Free tier allowances can change; check [Cloudflare pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [Neon pricing](https://neon.com/pricing) for current limits.

## Logo and habits

The logo is served from `assets/logo.png`; replace that file to change the image. Shared habit keys and Arabic labels live in `shared/habits.js`.
