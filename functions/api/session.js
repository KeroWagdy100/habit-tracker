import { response, methodNotAllowed, authenticate, safeError } from '../_lib.js';

export async function onRequest(context) {
  if (context.request.method !== 'GET') return methodNotAllowed();
  try {
    const user = await authenticate(context);
    if (!user) return response(401, { error: 'سجّل دخولك الأول.' });
    return response(200, { user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    return safeError('Session lookup failed', error, 'تعذر التحقق من تسجيل الدخول. حاول مرة تانية.');
  }
}
