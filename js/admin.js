const adminDate = new Date();
const localToday = `${adminDate.getFullYear()}-${String(adminDate.getMonth() + 1).padStart(2, '0')}-${String(adminDate.getDate()).padStart(2, '0')}`;
const select = document.querySelector('#student-select');
const historyBox = document.querySelector('#student-history');
const adminMessage = document.querySelector('#admin-message');
const todayBody = document.querySelector('#today-body');

function addCell(row, value, className = '') {
  const cell = document.createElement('td');
  if (className) cell.className = className;
  cell.textContent = value;
  row.append(cell);
  return cell;
}

function statusCell(row, value, label) {
  const cell = document.createElement('td');
  const mark = document.createElement('span');
  mark.className = `status-dot ${value ? 'done' : ''}`;
  mark.textContent = value ? '✓' : '—';
  mark.setAttribute('aria-label', value ? `${label}: مكتملة` : `${label}: غير مكتملة`);
  cell.append(mark);
  row.append(cell);
}

async function initAdmin() {
  const user = currentUser();
  if (!user) { location.replace('/login.html'); return; }
  if (user.role !== 'admin') { location.replace('/student.html'); return; }
  document.querySelector('#admin-date').textContent = formatArabicDate(localToday);
  try {
    const rows = await api('/api/admin/tracks');
    todayBody.replaceChildren();
    if (!rows.length) {
      const row = document.createElement('tr');
      const cell = addCell(row, 'مفيش طلاب مسجلين لسه.');
      cell.colSpan = 5;
      todayBody.append(row);
      return;
    }
    rows.forEach((student) => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const button = document.createElement('button');
      button.className = 'student-link';
      button.type = 'button';
      button.dataset.student = student.studentId;
      button.textContent = student.username;
      nameCell.append(button);
      row.append(nameCell);
      statusCell(row, student.date ? student.prayer : false, 'الصلاة');
      statusCell(row, student.date ? student.read_bible : false, 'الكتاب المقدس');
      addCell(row, student.date && student.has_verse ? 'موجودة' : '—', 'compact-status');
      addCell(row, student.date && student.has_reflection ? 'موجود' : '—', 'compact-status');
      todayBody.append(row);
      const option = document.createElement('option');
      option.value = student.studentId;
      option.textContent = student.username;
      select.append(option);
    });
  } catch (error) {
    adminMessage.textContent = error.message;
    if (error.message.includes('سجّل دخولك')) { sessionStorage.removeItem(USER_KEY); location.replace('/login.html'); }
  }
}

select.addEventListener('change', async () => {
  historyBox.replaceChildren();
  if (!select.value) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'اختار طالب علشان تشوف سجله.';
    historyBox.append(empty);
    return;
  }
  try {
    const result = await api(`/api/admin/tracks?studentId=${encodeURIComponent(select.value)}`);
    const heading = document.createElement('p');
    heading.className = 'history-name';
    heading.textContent = result.student;
    historyBox.append(heading);
    renderTrackCards(historyBox, result.tracks);
  } catch (error) {
    const message = document.createElement('p');
    message.className = 'form-message';
    message.textContent = error.message;
    historyBox.append(message);
  }
});

todayBody.addEventListener('click', (event) => {
  const button = event.target.closest('[data-student]');
  if (button) {
    select.value = button.dataset.student;
    select.dispatchEvent(new Event('change'));
    select.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

initAdmin();
import { api, currentUser, USER_KEY } from './api.js';
import { formatArabicDate, renderTrackCards } from './ui.js';
