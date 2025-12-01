// Cargar preferencia al inicio
(function initTheme() {
  const saved = localStorage.getItem('theme'); // 'light' | 'dark'
  const prefersDark = window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const theme = saved || (prefersDark ? 'dark' : 'light');

  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  // Actualizar estado del botón si existe
  const btn = document.getElementById('modo-btn');
  const icon = document.getElementById('icono-modo');
  if (btn && icon) {
    const isDark = document.body.classList.contains('dark-mode');
    btn.setAttribute('aria-pressed', String(isDark));
    btn.textContent = isDark ? ' Light mode' : ' Dark mode';
    icon.textContent = isDark ? '☀️' : '🌙';
    btn.prepend(icon);
  }
})();

// Función llamada desde el onclick del botón
function alternarModo() {
  const isDark = document.body.classList.toggle('dark-mode');
  const btn = document.getElementById('modo-btn');
  const icon = document.getElementById('icono-modo');

  if (btn && icon) {
    btn.setAttribute('aria-pressed', String(isDark));
    // Si tu interfaz está en español:
    btn.textContent = isDark ? ' Modo Claro' : ' Modo Oscuro';
    icon.textContent = isDark ? '☀️' : '🌙';
    btn.prepend(icon);
  }
}
