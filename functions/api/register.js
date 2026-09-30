import { db, response, methodNotAllowed, parseBody, safeError } from '../_lib.js';

export async function onRequest(context) {
  if (context.request.method !== 'POST') return methodNotAllowed();
  const body = await parseBody(context.request);
  if (!body || Object.hasOwn(body, 'role')) return response(400, { error: 'بيانات التسجيل غير صالحة.' });
  const { username, password } = body;
  if (typeof username !== 'string' || username.trim().length < 2 || username.trim().length > 30 || !/^[a-zA-Z0-9_]+$/.test(username.trim())) {
    return response(400, { error: 'اسم المستخدم من حرفين إلى ٣٠ حرفًا، واستخدم حروفًا إنجليزية أو أرقامًا أو _ فقط.' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) return response(400, { error: 'كلمة المرور لازم تكون من ٨ إلى ٧٢ حرفًا.' });
  try {
    const sql = db(context.env);
    const rows = await sql`INSERT INTO users (username, password_hash, role) VALUES (${username.trim()}, crypt(${password}, gen_salt('bf', 12)), 'student') ON CONFLICT (username) DO NOTHING RETURNING id`;
    if (!rows.length) return response(409, { error: 'اسم المستخدم مستخدم بالفعل.' });
    return response(201, { message: 'تم إنشاء الحساب. تقدر تسجّل الدخول دلوقتي.' });
  } catch (error) {
    return safeError('Registration failed', error, 'تعذر إنشاء الحساب. حاول مرة تانية.');
  }
}
