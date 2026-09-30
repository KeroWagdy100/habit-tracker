const { db, response, methodNotAllowed, authenticate } = require('./_lib');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return response(204, {});
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  try {
    const user = await authenticate(event);
    const header = event.headers.authorization || event.headers.Authorization || '';
    const token = header.replace(/^Bearer /i, '');
    if (user) await db()`DELETE FROM sessions WHERE token = ${token}`;
    return response(200, { message: 'تم تسجيل الخروج.' });
  } catch (error) {
    console.error('Logout failed:', error.message);
    return response(500, { error: 'تعذر تسجيل الخروج.' });
  }
};
