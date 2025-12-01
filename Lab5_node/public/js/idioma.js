function cambiarIdioma() {
  const select = document.getElementById('idioma-select');
  const lang = select.value;

  if (lang === 'es') {
    window.location.href = '/';
  } else if (lang === 'en') {
    window.location.href = '/en';
  }
}
