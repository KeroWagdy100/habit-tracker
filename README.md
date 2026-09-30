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

## Deploy

Connect the GitHub repository to Netlify, configure `DATABASE_URL`, and deploy. Netlify publishes the static pages and the functions under `netlify/functions`. Production traffic uses HTTPS. No database credentials are included in the frontend.

## Logo, habits, and API

Place the PNG logo in `assets/logo.png` or edit `LOGO_PATH` in `js/config.js`. The four shared habits are defined in `shared/habits.js`; that file is used by the browser and backend. API routes are `/api/register`, `/api/login`, `/api/logout`, `/api/tracks`, and `/api/admin/tracks` (admin history uses a `studentId` query parameter, validated and authorized server-side).

The session token is held in browser `sessionStorage` and expires after 30 days; passwords are never persisted client-side. Sessions and all track authorization are checked by the backend.
