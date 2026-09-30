// Logo asset: ./assets/logo.png (served from the site root).
const LOGO_PATH = '/assets/logo.png';

document.querySelectorAll('[data-app-logo]').forEach((image) => {
  image.src = LOGO_PATH;
  image.addEventListener('error', () => { image.hidden = true; });
});
