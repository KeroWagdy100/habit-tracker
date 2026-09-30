import { getSessionUser } from './api.js';

try {
  const user = await getSessionUser();
  location.replace(user.role === 'admin' ? '/admin.html' : '/student.html');
} catch (_) {
  // Keep the public landing page available when no active session exists.
}
