# Daily Practice — Habit Tracker

A small student habit tracker using static HTML/CSS/vanilla JavaScript, Netlify Functions, and Neon PostgreSQL.

## Local setup

1. Create a free Neon PostgreSQL project and copy its connection string.
2. Run [`schema.sql`](schema.sql) in the Neon SQL Editor for a new database. For an existing database, run [`migrations/20260930_habit_fields.sql`](migrations/20260930_habit_fields.sql) to rename the prayer and Bible fields, add the verse and reflection fields, and preserve the discontinued Study and Exercise values in `track_legacy_habits`.
3. Install dependencies with `npm install`.
4. Keep the Neon-generated `.env.local` in the project root (it is ignored by Git). Netlify Dev reads it automatically. If needed, copy it to `.env`, which is also ignored.
5. Start the local Netlify environment with `npm run dev` and open the URL shown by Netlify.

Netlify Dev reads `.env` for local function environment variables. In production, set `DATABASE_URL` in the Netlify site's environment variables.

## Admin account

Registration always creates a student; the backend rejects a submitted `role`. To promote a user manually, run this in the Neon SQL Editor:

```sql
UPDATE users SET role = 'admin' WHERE username = 'your-admin-username';
```

## Deploy to Netlify

The production Neon database has already been migrated to the current habit fields. It contains the existing user account, so you do not need to run `schema.sql` against production.

1. Sign in to [Netlify](https://app.netlify.com/) and choose **Add new site → Import an existing project**.
2. Connect GitHub, authorize Netlify if prompted, and select `KeroWagdy100/habit-tracker`.
3. Keep the repository's Netlify settings: publish directory `.` and functions directory `netlify/functions`. Leave the build command empty; there is no frontend build step.
4. Before deploying, open the site's **Environment variables** settings and add `DATABASE_URL` with the connection string for the **production** Neon branch. Do not use the temporary `rtl-habits-test-20260930` branch or commit the connection string. Make it available to Netlify Functions (all deploy contexts is simplest).
5. Deploy the site. Netlify will publish the static pages and package the functions. The `netlify.toml` file configures the `/api/*` routes.
6. Open the Netlify URL and test registration/login and the student dashboard. Promote an existing account to admin using the SQL under [Admin account](#admin-account), then sign in with it and verify the admin page.

Future pushes to the connected production branch will trigger new deploys. Netlify serves the site over HTTPS; no custom domain is required. Never put `DATABASE_URL` in frontend files or GitHub.

## Logo, habits, and API

Place the PNG logo in `assets/logo.png` or edit `LOGO_PATH` in `js/config.js`. The four shared habits are defined in `shared/habits.js`; that file is used by the browser and backend. API routes are `/api/register`, `/api/login`, `/api/logout`, `/api/tracks`, and `/api/admin/tracks` (admin history uses a `studentId` query parameter, validated and authorized server-side).

The session token is held in browser `sessionStorage` and expires after 30 days; passwords are never persisted client-side. Sessions and all track authorization are checked by the backend.
