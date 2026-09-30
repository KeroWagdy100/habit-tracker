const { neon } = require('@neondatabase/serverless');
const { HABITS } = require('../../shared/habits');

const SESSION_DAYS = 30;

function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(process.env.DATABASE_URL);
}

function response(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders },
    body: JSON.stringify(body)
  };
}

function methodNotAllowed() { return response(405, { error: 'طريقة الطلب غير مدعومة.' }, { Allow: 'GET, POST, OPTIONS' }); }
function parseBody(event) {
  try { return JSON.parse(event.body || '{}'); } catch { return null; }
}

async function authenticate(event) {
  const header = event.headers.authorization || event.headers.Authorization || '';
  const match = header.match(/^Bearer ([\da-f]{64})$/i);
  if (!match) return null;
  const sql = db();
  const rows = await sql`
    SELECT u.id, u.username, u.role FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${match[1]} AND s.expires_at > CURRENT_TIMESTAMP
  `;
  return rows[0] || null;
}

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function validTrackInput(body) {
  if (!body || !isValidDate(body.date)) return false;
  return HABITS.every((habit) => habit.type === 'checkbox'
    ? typeof body[habit.key] === 'boolean'
    : typeof body[habit.key] === 'string' && body[habit.key].length <= habit.maxLength);
}

function dateOnly(value) {
  if (typeof value === 'string') return value.slice(0, 10);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

function track(row) {
  return {
    date: dateOnly(row.track_date),
    prayer: row.prayer,
    read_bible: row.read_bible,
    verse: row.verse,
    reflection: row.reflection
  };
}

module.exports = { HABITS, SESSION_DAYS, db, response, methodNotAllowed, parseBody, authenticate, isValidDate, validTrackInput, dateOnly, track };
