import { db, response, methodNotAllowed, parseBody, SESSION_DAYS, sessionCookie, safeError } from '../_lib.js';

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') return methodNotAllowed();
  const body = await parseBody(context.request);
  if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') return response(400, { error: 'اكتب اسم المستخدم وكلمة المرور.' });
  try {
    const sql = db(context.env);
    const users = await sql`SELECT id, username, role FROM users
      WHERE username = ${body.username.trim()}
        AND (CASE WHEN left(password_hash, 4) = '$2b$' THEN '$2a$' || substring(password_hash FROM 5) ELSE password_hash END)
          = crypt(${body.password}, CASE WHEN left(password_hash, 4) = '$2b$' THEN '$2a$' || substring(password_hash FROM 5) ELSE password_hash END)
      LIMIT 1`;
    if (!users[0]) return response(401, { error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    const token = randomToken();
    await sql`INSERT INTO sessions (token, user_id, expires_at) VALUES (${token}, ${users[0].id}, CURRENT_TIMESTAMP + (${SESSION_DAYS} * INTERVAL '1 day'))`;
    return response(200, { user: { username: users[0].username, role: users[0].role } }, { 'Set-Cookie': sessionCookie(token) });
  } catch (error) {
    return safeError('Login failed', error, 'تعذر تسجيل الدخول. حاول مرة تانية.');
  }
}
