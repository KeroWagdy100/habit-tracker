import { db, response, methodNotAllowed, authenticate, dateOnly, track, safeError } from '../../_lib.js';

export async function onRequest(context) {
  if (context.request.method !== 'GET') return methodNotAllowed();
  try {
    const admin = await authenticate(context);
    if (!admin) return response(401, { error: 'سجّل دخولك للمتابعة.' });
    if (admin.role !== 'admin') return response(403, { error: 'هذه الصفحة متاحة للمشرفين فقط.' });
    const sql = db(context.env);
    const studentId = new URL(context.request.url).searchParams.get('studentId');
    if (studentId !== null && !/^\d+$/.test(studentId)) return response(400, { error: 'اختيار الطالب غير صالح.' });
    if (studentId !== null) {
      const students = await sql`SELECT id, username FROM users WHERE id = ${Number(studentId)} AND role = 'student'`;
      if (!students[0]) return response(404, { error: 'الطالب غير موجود.' });
      const rows = await sql`SELECT track_date, prayer, read_bible, verse, reflection FROM tracks WHERE user_id = ${Number(studentId)} ORDER BY track_date DESC`;
      return response(200, { student: students[0].username, tracks: rows.map(track) });
    }
    const rows = await sql`SELECT u.id AS "studentId", u.username, t.track_date, t.prayer, t.read_bible,
        (t.verse IS NOT NULL AND t.verse <> '') AS has_verse,
        (t.reflection IS NOT NULL AND t.reflection <> '') AS has_reflection
      FROM users u LEFT JOIN tracks t ON t.user_id = u.id AND t.track_date = CURRENT_DATE
      WHERE u.role = 'student' ORDER BY u.username`;
    return response(200, rows.map((row) => ({
      studentId: row.studentId,
      username: row.username,
      date: row.track_date ? dateOnly(row.track_date) : null,
      prayer: row.prayer ?? false,
      read_bible: row.read_bible ?? false,
      has_verse: row.has_verse ?? false,
      has_reflection: row.has_reflection ?? false
    })));
  } catch (error) {
    return safeError('Admin request failed', error, 'تعذر تحميل بيانات المشرف.');
  }
}
