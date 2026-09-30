const bcrypt = require('bcryptjs');
const { randomBytes } = require('node:crypto');
const { db, response, methodNotAllowed, parseBody, SESSION_DAYS } = require('./_lib');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return response(204, {});
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const body = parseBody(event);
  if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') return response(400, { error: 'اكتب اسم المستخدم وكلمة المرور.' });
  try {
    const sql = db();
    const users = await sql`SELECT id, username, password_hash, role FROM users WHERE username = ${body.username.trim()} LIMIT 1`;
    if (!users[0] || !(await bcrypt.compare(body.password, users[0].password_hash))) return response(401, { error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    const token = randomBytes(32).toString('hex');
    await sql`INSERT INTO sessions (token, user_id, expires_at) VALUES (${token}, ${users[0].id}, CURRENT_TIMESTAMP + (${SESSION_DAYS} * INTERVAL '1 day'))`;
    return response(200, { token, user: { username: users[0].username, role: users[0].role } });
  } catch (error) {
    console.error('Login failed:', error.message);
    return response(500, { error: 'تعذر تسجيل الدخول. حاول مرة تانية.' });
  }
};
