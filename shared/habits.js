const HABITS = [
  { key: 'prayer', label: 'الصلاة اليوم', type: 'checkbox' },
  { key: 'read_bible', label: 'كتابك المقدس', type: 'checkbox' },
  { key: 'verse', label: 'آية النهاردة', type: 'text', maxLength: 1000 },
  { key: 'reflection', label: 'تأمل في الآية', type: 'textarea', maxLength: 6000 }
];

if (typeof module !== 'undefined' && module.exports) module.exports = { HABITS };
else window.HABITS = HABITS;
