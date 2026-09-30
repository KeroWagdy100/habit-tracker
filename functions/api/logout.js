import { db, response, methodNotAllowed, authenticate, sessionCookie, safeError } from '../_lib.js';

export async function onRequest(context) {
  if (context.request.method !== 'POST') return methodNotAllowed();
  try {
    const user = await authenticate(context);
    if (user) await db(context.env)`DELETE FROM sessions WHERE token = ${user.token}`;
    return response(200, { message: 'تم تسجيل الخروج.' }, { 'Set-Cookie': sessionCookie('', 0) });
  } catch (error) {
    return safeError('Logout failed', error, 'تعذر تسجيل الخروج.');
  }
}
