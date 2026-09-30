function showFormMessage(form, message, success = false) {
  const target = form.querySelector('.form-message');
  target.textContent = message;
  target.classList.toggle('success', success);
}

function validateAuthForm(form, isRegistration) {
  const username = form.elements.username.value.trim();
  const password = form.elements.password.value;
  if (isRegistration && (username.length < 2 || username.length > 30 || !/^[a-zA-Z0-9_]+$/.test(username))) {
    showFormMessage(form, 'اسم المستخدم من حرفين إلى ٣٠ حرفًا، واستخدم حروفًا إنجليزية أو أرقامًا أو _ فقط.');
    return false;
  }
  if (!username) { showFormMessage(form, 'اكتب اسم المستخدم.'); return false; }
  if (!password) { showFormMessage(form, 'اكتب كلمة المرور.'); return false; }
  if (isRegistration && (password.length < 8 || password.length > 72)) {
    showFormMessage(form, 'كلمة المرور لازم تكون من ٨ إلى ٧٢ حرفًا.');
    return false;
  }
  return true;
}

document.querySelector('#login-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  if (!validateAuthForm(form, false)) return;
  const values = new FormData(form);
  button.disabled = true;
  showFormMessage(form, 'جارٍ تسجيل الدخول…');
  try {
    const result = await api('/api/login', { method: 'POST', body: JSON.stringify({ username: values.get('username'), password: values.get('password') }) });
    sessionStorage.setItem(SESSION_KEY, result.token);
    sessionStorage.setItem('habit-tracker-user', JSON.stringify(result.user));
    location.href = result.user.role === 'admin' ? '/admin.html' : '/student.html';
  } catch (error) { showFormMessage(form, error.message); button.disabled = false; }
});

document.querySelector('#register-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  if (!validateAuthForm(form, true)) return;
  const values = new FormData(form);
  button.disabled = true;
  showFormMessage(form, 'جارٍ إنشاء الحساب…');
  try {
    const result = await api('/api/register', { method: 'POST', body: JSON.stringify({ username: values.get('username'), password: values.get('password') }) });
    showFormMessage(form, result.message, true);
    form.reset();
    window.setTimeout(() => { location.href = '/login.html'; }, 900);
  } catch (error) { showFormMessage(form, error.message); button.disabled = false; }
});
