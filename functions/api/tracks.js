import { db, response, methodNotAllowed, parseBody, authenticate, validTrackInput, track, safeError } from '../_lib.js';

export async function onRequest(context) {
  const method = context.request.method;
  if (!['GET', 'POST'].includes(method)) return methodNotAllowed();
  try {
    const user = await authenticate(context);
    if (!user) return response(401, { error: 'سجّل دخولك للمتابعة.' });
    if (user.role !== 'student') return response(403, { error: 'هذه الصفحة متاحة للطلاب فقط.' });
    const sql = db(context.env);
    if (method === 'GET') {
      const rows = await sql`SELECT track_date, prayer, read_bible, verse, reflection FROM tracks WHERE user_id = ${user.id} ORDER BY track_date DESC`;
      return response(200, rows.map(track));
    }
    const body = await parseBody(context.request);
    if (!validTrackInput(body)) return response(400, { error: 'راجع التاريخ والعلامات والنصوص المدخلة.' });
    await sql`INSERT INTO tracks (user_id, track_date, prayer, read_bible, verse, reflection)
      VALUES (${user.id}, ${body.date}, ${body.prayer}, ${body.read_bible}, ${body.verse.trim()}, ${body.reflection.trim()})
      ON CONFLICT (user_id, track_date) DO UPDATE SET
        prayer = EXCLUDED.prayer,
        read_bible = EXCLUDED.read_bible,
        verse = EXCLUDED.verse,
        reflection = EXCLUDED.reflection`;
    return response(200, { message: 'تم حفظ متابعة اليوم.' });
  } catch (error) {
    return safeError('Track request failed', error, 'تعذر تحميل المتابعة أو حفظها. حاول مرة أخرى.');
  }
}
