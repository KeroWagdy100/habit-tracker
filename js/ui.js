export function formatArabicDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function renderTrackCards(container, tracks) {
  container.querySelectorAll(':scope > .track-card, :scope > .empty-state').forEach((node) => node.remove());
  if (!tracks.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'لسه مفيش متابعات سابقة.';
    container.append(empty);
    return;
  }
  tracks.forEach((track) => {
    const card = document.createElement('article');
    card.className = 'track-card';
    const heading = document.createElement('div');
    heading.className = 'track-card-heading';
    const date = document.createElement('h3');
    date.textContent = formatArabicDate(track.date);
    const count = Number(track.prayer) + Number(track.read_bible);
    const summary = document.createElement('span');
    summary.className = 'count-pill';
    summary.textContent = `${new Intl.NumberFormat('ar-EG').format(count)} / ٢ عادتين`;
    heading.append(date, summary);
    card.append(heading);
    HABITS.forEach((habit) => {
      const item = document.createElement('div');
      item.className = habit.type === 'checkbox' ? 'track-item check-item' : 'track-item text-item';
      const label = document.createElement('strong');
      label.textContent = habit.label;
      item.append(label);
      if (habit.type === 'checkbox') {
        const status = document.createElement('span');
        status.className = `track-status ${track[habit.key] ? 'complete' : ''}`;
        status.textContent = track[habit.key] ? 'تمت' : 'لم تتم';
        item.append(status);
      } else {
        const value = document.createElement('p');
        value.className = 'track-copy';
        value.dir = 'auto';
        value.textContent = track[habit.key] || 'لم تُسجّل اليوم.';
        item.append(value);
      }
      card.append(item);
    });
    container.append(card);
  });
}
