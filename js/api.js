const SESSION_KEY = 'habit-tracker-session';

async function api(path, options = {}) {
  const token = sessionStorage.getItem(SESSION_KEY);
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(path, { ...options, headers, cache: 'no-store' });
  } catch (_) {
    throw new Error('تعذر الاتصال بالخدمة. تأكد من اتصالك بالإنترنت وحاول مرة تانية.');
  }
  let data;
  try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) throw new Error(data.error || 'حصلت مشكلة، حاول مرة تانية.');
  return data;
}

function currentUser() {
  try { return JSON.parse(sessionStorage.getItem('habit-tracker-user') || 'null'); } catch { return null; }
}

async function logout() {
  try { await api('/api/logout', { method: 'POST' }); } catch (_) {}
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem('habit-tracker-user');
  location.href = '/login.html';
}

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-logout]')) logout();
});
