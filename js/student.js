const today = new Date();
const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const form = document.querySelector('#track-form');
const historyNode = document.querySelector('#history-list');
const message = form.querySelector('.form-message');

function updateCount() {
  const checked = [...form.querySelectorAll('input[type="checkbox"]')].filter((input) => input.checked).length;
  document.querySelector('#today-count').textContent = `${new Intl.NumberFormat('ar-EG').format(checked)} / ٢`;
}

function createHabitField(habit, value = '') {
  const row = document.createElement('div');
  row.className = `habit-field habit-${habit.type}`;
  const label = document.createElement('label');
  label.className = habit.type === 'checkbox' ? 'check-label' : 'field-label';
  label.textContent = habit.label;
  if (habit.type === 'checkbox') {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = habit.key;
    input.checked = Boolean(value);
    input.setAttribute('aria-label', habit.label);
    const visual = document.createElement('span');
    visual.className = 'custom-check';
    label.prepend(input, visual);
    row.append(label);
    return row;
  }
  const input = document.createElement(habit.type === 'textarea' ? 'textarea' : 'input');
  if (input.tagName === 'INPUT') input.type = 'text';
  input.name = habit.key;
  input.value = value || '';
  input.dir = 'auto';
  input.maxLength = habit.maxLength;
  input.setAttribute('aria-label', habit.label);
  input.placeholder = habit.key === 'verse' ? 'اكتب الآية أو مرجعها…' : 'اكتب اللي لمس قلبك…';
  input.id = `field-${habit.key}`;
  label.htmlFor = input.id;
  row.append(label, input);
  return row;
}

function renderHabitForm(track) {
  document.querySelector('#habits-list').replaceChildren(...HABITS.map((habit) => createHabitField(habit, track?.[habit.key] ?? '')));
  updateCount();
}

function getTrackValues() {
  return {
    date: localDate,
    prayer: form.elements.prayer.checked,
    read_bible: form.elements.read_bible.checked,
    verse: form.elements.verse.value.trim(),
    reflection: form.elements.reflection.value.trim()
  };
}

function setTrackMessage(text, success = false) {
  message.textContent = text;
  message.classList.toggle('success', success);
}

async function init() {
  let user;
  try { user = await getSessionUser(); }
  catch (error) {
    if (error.status === 401) location.replace('/login.html');
    else setTrackMessage(error.message);
    return;
  }
  if (user.role === 'admin') { location.replace('/admin.html'); return; }
  document.querySelector('#username').textContent = user.username;
  document.querySelector('#today-date').textContent = new Date().toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' });
  renderHabitForm(null);
  form.addEventListener('change', updateCount);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button');
    button.disabled = true;
    setTrackMessage('جارٍ حفظ المتابعة…');
    try {
      await api('/api/tracks', { method: 'POST', body: JSON.stringify(getTrackValues()) });
      setTrackMessage('اتحفظت متابعة النهاردة.', true);
      await loadTracks();
    } catch (error) { setTrackMessage(error.message); }
    button.disabled = false;
  });
  await loadTracks();
}

async function loadTracks() {
  try {
    const tracks = await api('/api/tracks');
    const current = tracks.find((item) => item.date === localDate);
    if (current) renderHabitForm(current);
    renderTrackCards(historyNode, tracks.filter((item) => item.date !== localDate));
  } catch (error) {
    if (error.message.includes('سجّل دخولك')) { sessionStorage.removeItem(USER_KEY); location.replace('/login.html'); }
    else setTrackMessage(error.message);
  }
}

init();
import { HABITS } from '../shared/habits.js';
import { api, getSessionUser, USER_KEY } from './api.js';
import { renderTrackCards } from './ui.js';
