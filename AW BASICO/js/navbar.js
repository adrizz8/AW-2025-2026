let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;

  if (currentScroll > lastScrollTop) {
    // scrolleando hacia abajo → ocultar
    navbar.classList.add('hide');
  } else {
    // scrolleando hacia arriba → mostrar
    navbar.classList.remove('hide');
  }

  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // evitar valores negativos
});
