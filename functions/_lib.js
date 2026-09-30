import { neon } from '@neondatabase/serverless';
import { HABITS } from '../shared/habits.js';

export const SESSION_DAYS = 30;
const SESSION_COOKIE = 'habit_tracker_session';

export function db(env) {
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(env.DATABASE_URL);
}

export function response(status, body, extraHeaders = {}) {
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders });
  return new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
}

export function methodNotAllowed() {
  return response(405, { error: 'طريقة الطلب غير مدعومة.' }, { Allow: 'GET, POST' });
}

export async function parseBody(request) {
  try { return await request.json(); } catch { return null; }
}

export function getSessionToken(request) {
  const cookies = request.headers.get('Cookie') || '';
  const value = cookies.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  const token = value?.slice(SESSION_COOKIE.length + 1) || '';
  return /^[\da-f]{64}$/i.test(token) ? token : null;
}

export function sessionCookie(token, maxAge = SESSION_DAYS * 24 * 60 * 60) {
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

export async function authenticate(context) {
  const token = getSessionToken(context.request);
  if (!token) return null;
  const sql = db(context.env);
  const rows = await sql`
    SELECT u.id, u.username, u.role FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token} AND s.expires_at > CURRENT_TIMESTAMP
  `;
  return rows[0] ? { ...rows[0], token } : null;
}

export function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function validTrackInput(body) {
  if (!body || !isValidDate(body.date)) return false;
  return HABITS.every((habit) => habit.type === 'checkbox'
    ? typeof body[habit.key] === 'boolean'
    : typeof body[habit.key] === 'string' && body[habit.key].length <= habit.maxLength);
}

export function dateOnly(value) {
  if (typeof value === 'string') return value.slice(0, 10);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

export function track(row) {
  return {
    date: dateOnly(row.track_date),
    prayer: row.prayer,
    read_bible: row.read_bible,
    verse: row.verse,
    reflection: row.reflection
  };
}

export function safeError(label, error, message) {
  console.error(`${label}:`, error?.message || error);
  return response(500, { error: message });
}
