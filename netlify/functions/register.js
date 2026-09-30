const bcrypt = require('bcryptjs');
const { db, response, methodNotAllowed, parseBody } = require('./_lib');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return response(204, {});
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const body = parseBody(event);
  if (!body || Object.hasOwn(body, 'role')) return response(400, { error: 'بيانات التسجيل غير صالحة.' });
  const { username, password } = body;
  if (typeof username !== 'string' || username.trim().length < 2 || username.trim().length > 30 || !/^[a-zA-Z0-9_]+$/.test(username.trim())) {
    return response(400, { error: 'اسم المستخدم من حرفين إلى ٣٠ حرفًا، واستخدم حروفًا إنجليزية أو أرقامًا أو _ فقط.' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) return response(400, { error: 'كلمة المرور لازم تكون من ٨ إلى ٧٢ حرفًا.' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const sql = db();
    const rows = await sql`INSERT INTO users (username, password_hash, role) VALUES (${username.trim()}, ${hash}, 'student') ON CONFLICT (username) DO NOTHING RETURNING id`;
    if (!rows.length) return response(409, { error: 'اسم المستخدم مستخدم بالفعل.' });
    return response(201, { message: 'تم إنشاء الحساب. تقدر تسجّل الدخول دلوقتي.' });
  } catch (error) {
    console.error('Registration failed:', error.message);
    return response(500, { error: 'تعذر إنشاء الحساب. حاول مرة تانية.' });
  }
};
