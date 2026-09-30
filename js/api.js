export const USER_KEY = 'habit-tracker-user';

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  let response;
  try {
    response = await fetch(path, { ...options, headers, cache: 'no-store', credentials: 'same-origin' });
  } catch (_) {
    throw new Error('تعذر الاتصال بالخدمة. تأكد من اتصالك بالإنترنت وحاول مرة تانية.');
  }
  let data;
  try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) throw new Error(data.error || 'حصلت مشكلة، حاول مرة تانية.');
  return data;
}

export function currentUser() {
  try { return JSON.parse(sessionStorage.getItem('habit-tracker-user') || 'null'); } catch { return null; }
}

export async function logout() {
  try { await api('/api/logout', { method: 'POST' }); } catch (_) {}
  sessionStorage.removeItem(USER_KEY);
  location.href = '/login.html';
}

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-logout]')) logout();
});
