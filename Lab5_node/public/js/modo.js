// Cargar preferencia al inicio (modo oscuro)
(function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const theme = saved || (prefersDark ? 'dark' : 'light');

  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  const btn = document.getElementById('modo-btn');
  const icon = document.getElementById('icono-modo');
  if (btn && icon) {
    const isDark = document.body.classList.contains('dark-mode');
    btn.setAttribute('aria-pressed', String(isDark));
    icon.textContent = isDark ? '☀️' : '🌙';
    btn.prepend(icon);
  }
})();

// Botón modo claro/oscuro
function alternarModo() {
  const isDark = document.body.classList.toggle('dark-mode');
  const btn = document.getElementById('modo-btn');
  const icon = document.getElementById('icono-modo');

  localStorage.setItem('theme', isDark ? 'dark' : 'light');

  if (btn && icon) {
    btn.setAttribute('aria-pressed', String(isDark));
    btn.textContent = isDark ? ' Modo Claro' : ' Modo Oscuro';
    icon.textContent = isDark ? '☀️' : '🌙';
    btn.prepend(icon);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const btnTextoGrande = document.getElementById('btn-texto-grande');
  const btnContraste   = document.getElementById('btn-contraste');
  const btnReset       = document.getElementById('btn-reset-accesibilidad');
  const STORAGE_KEY    = 'modoTextoGrande';

  // 1) Aplicar preferencia de texto grande SIEMPRE
  if (localStorage.getItem(STORAGE_KEY) === 'on') {
    document.body.classList.add('texto-grande');
    if (btnTextoGrande) {
      btnTextoGrande.setAttribute('aria-pressed', 'true');
    }
  }

  // 2) Si hay botón de texto grande, permitir togglear
  if (btnTextoGrande) {
    btnTextoGrande.addEventListener('click', function () {
      const activado = document.body.classList.toggle('texto-grande');
      btnTextoGrande.setAttribute('aria-pressed', activado ? 'true' : 'false');
      localStorage.setItem(STORAGE_KEY, activado ? 'on' : 'off');
    });
  }

  // 3) Botón contraste
  if (btnContraste) {
    btnContraste.addEventListener('click', function () {
      alternarModo();
    });
  }

  // 4) Botón reset accesibilidad
  if (btnReset) {
    btnReset.addEventListener('click', function () {
      document.body.classList.remove('texto-grande', 'dark-mode', 'oscuro');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('theme');
      const btnTexto = document.getElementById('btn-texto-grande');
      if (btnTexto) btnTexto.setAttribute('aria-pressed', 'false');
      const modoBtn = document.getElementById('modo-btn');
      const iconoModo = document.getElementById('icono-modo');
      if (modoBtn && iconoModo) {
        modoBtn.setAttribute('aria-pressed', 'false');
        modoBtn.textContent = ' Modo Oscuro';
        iconoModo.textContent = '🌙';
        modoBtn.prepend(iconoModo);
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('btn-header-toggle');
  const menu = document.getElementById('header-menu');

  if (!toggleBtn || !menu) return;

  toggleBtn.addEventListener('click', () => {
    menu.classList.toggle('show');
  });
});
