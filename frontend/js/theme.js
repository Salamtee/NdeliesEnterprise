const THEME_KEY = 'ndelies_theme';

function setIcon(isDark) {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  icon.classList.toggle('fa-moon', !isDark);
  icon.classList.toggle('fa-sun', isDark);
}

export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    setIcon(true);
  }
}

export function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  if (isDark) {
    html.removeAttribute('data-theme');
    localStorage.setItem(THEME_KEY, 'light');
    setIcon(false);
  } else {
    html.setAttribute('data-theme', 'dark');
    localStorage.setItem(THEME_KEY, 'dark');
    setIcon(true);
  }
}
