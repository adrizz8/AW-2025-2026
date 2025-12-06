function alternarModo() {
  const body = document.body;
  const boton = document.getElementById('modo-btn');
  const icono = document.getElementById('icono-modo');
  const enOscuro = body.classList.toggle('oscuro');
  boton.setAttribute('aria-pressed', enOscuro ? 'true' : 'false');
  icono.textContent = enOscuro ? '☀️' : '🌙';
  boton.innerHTML = icono.outerHTML + (enOscuro ? 'Modo Claro' : 'Modo Oscuro');
}

