

// El spinner
function mostrarSpinner(mostrar) {
  const spinner = document.getElementById('spinner');
  if (mostrar) spinner.classList.add('active');
  else spinner.classList.remove('active');
}

// Toast / Mensajes para avisar de posibles fallos a la hora de procesar la reserva
function mostrarMensaje(mensaje, tipo) {
  const alertDiv = document.createElement('div');
  alertDiv.className =
    `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
  alertDiv.style.zIndex = '10000';
  alertDiv.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 5000);
}

const form = document.getElementById("form-nueva-reserva");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);

  // Convertimos en JSON
  const reserva = {
    id_vehiculo: formData.get("id_vehiculo"),
    dni_cliente: formData.get("dni_cliente"),
    nombre: formData.get("nombre"),
    fecha_inicio: formData.get("fecha_inicio"),
    fecha_fin: formData.get("fecha_fin")
  };

  mostrarSpinner(true);

  fetch("/reservas/nueva", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reserva)
  })
    .then(res => res.json())
    .then(result => {
      mostrarSpinner(false);

      if (!result.ok) {
        mostrarMensaje(result.error, "danger");
        return;
      }

      mostrarMensaje(result.mensaje, "success");

      if (window.agregarReservaATabla) {
        window.agregarReservaATabla(result.reserva_id);
      }

   
      form.reset();
      const modal = bootstrap.Modal.getInstance(document.getElementById("modalNuevaReserva"));
      if (modal) modal.hide();
    })
    .catch(err => {
      mostrarSpinner(false);
      console.error(err);
      mostrarMensaje("Error al conectar con el servidor", "danger");
    });
});

// Limpiamos los campos del modal al volver a abrirlo
document.getElementById("modalNuevaReserva").addEventListener("show.bs.modal", function () {
  form.reset();
});
