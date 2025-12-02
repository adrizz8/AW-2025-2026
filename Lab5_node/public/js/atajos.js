//ALT + SHIFT + R para ir a la página de reservar
document.addEventListener("keydown", function (e) {
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === "r") {
      e.preventDefault();
      window.location.href = "/reservar";
    }
  });

//ALT + SHIFT + V para ir a la página de ver reservas
document.addEventListener("keydown", function (e) {
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        window.location.href = "/lista_reservas";
    }
});

//ALT + SHIFT + H para ir a la página de inicio
document.addEventListener("keydown", function (e) {
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        window.location.href = "/";
    }
});