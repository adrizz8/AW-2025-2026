var hoy = new Date().toISOString().split('T')[0];
document.getElementById('fecha_inicio').setAttribute('min', hoy);
document.getElementById('fecha_fin').setAttribute('min', hoy);

// Función para mostrar/ocultar spinner
function mostrarSpinner(mostrar) {
  const spinner = document.getElementById('spinner');
  if (mostrar) {
    spinner.classList.add('active');
  } else {
    spinner.classList.remove('active');
  }
}

// Función para mostrar mensajes toast
function mostrarMensaje(mensaje, tipo) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
  alertDiv.style.zIndex = '10000';
  alertDiv.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Manejar el botón de realizar reserva
document.getElementById('btn-realizar-reserva').addEventListener('click', function() {
  const form = document.getElementById('form-reserva');
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const reserva = {
    nombre: document.getElementById('nombre').value,
    email: document.getElementById('email').value,
    telefono: document.getElementById('telefono').value,
    tipo_vehiculo: document.getElementById('tipo_vehiculo').value,
    fecha_inicio: document.getElementById('fecha_inicio').value,
    hora_inicio: document.getElementById('hora_inicio').value,
    fecha_fin: document.getElementById('fecha_fin').value,
    hora_fin: document.getElementById('hora_fin').value
  };

  mostrarSpinner(true);

  fetch('/api/reservas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reserva)
  })
  .then(function (res) {
    if (!res.ok && res.status === 500) {
      throw new Error('Error interno del servidor');
    }
    return res.json().then(function (data) {
      return { status: res.status, data: data };
    });
  })
  .then(function (result) {
    mostrarSpinner(false);
    const mensaje = document.getElementById('mensaje');

    // Manejo de códigos de estado
    if (result.status === 400) {
      mensaje.innerHTML = '<div class="alert alert-danger" role="alert">' + result.data.error + '</div>';
      return;
    }

    if (!result.data.ok) {
      mensaje.innerHTML = '<div class="alert alert-danger" role="alert">' + result.data.error + '</div>';
      return;
    }

    // RESERVA OK (201 Created)
    if (result.status === 201) {
      mensaje.innerHTML = '<div class="alert alert-success" role="alert">Reserva realizada correctamente</div>';
      mostrarMensaje('✅ Reserva creada exitosamente', 'success');

      if (window.agregarReservaATabla) {
        window.agregarReservaATabla(result.data.reserva);
      }

      setTimeout(function() {
        form.reset();
        mensaje.innerHTML = '';
        var modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevaReserva'));
        modal.hide();
      }, 1500);
    }
  })
  .catch(function (err) {
    mostrarSpinner(false);
    console.error('Error en la petición:', err);
    document.getElementById('mensaje').innerHTML =
      '<div class="alert alert-danger" role="alert">Error 500: Error al conectar con el servidor</div>';
    mostrarMensaje('❌ Error al conectar con el servidor', 'danger');
  });
});

// Limpiar mensajes al abrir el modal
document.getElementById('modalNuevaReserva').addEventListener('show.bs.modal', function () {
  document.getElementById('mensaje').innerHTML = '';
  document.getElementById('form-reserva').reset();
});

// Filtro por tipo de vehículo (en la tabla de reservas)
document.getElementById('filtroTipo').addEventListener('change', function() {
  const tipoSeleccionado = this.value;
  window.cargarReservasFiltradas(tipoSeleccionado);
});