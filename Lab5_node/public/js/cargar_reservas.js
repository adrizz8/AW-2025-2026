document.addEventListener("DOMContentLoaded", cargarReservas);

function cargarReservas() {
  fetch("/reservas/lista")
    .then(res => res.json())
    .then(data => {
      if (!data.ok) {
        document.getElementById("tbody").innerHTML =
          `<tr><td colspan="8">Error cargando reservas</td></tr>`;
        return;
      }

      const tbody = document.getElementById("tbody");
      tbody.innerHTML = "";

      if (data.reservas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">No tienes reservas registradas</td></tr>';
        return;
      }

      data.reservas.forEach(r => {
        tbody.innerHTML += `
          <tr>
            <td>${r.id_reserva}</td>
            <td>${r.id_vehiculo}</td>
            <td>${r.dni_cliente}</td>
            <td>${r.nombre}</td>
            <td>${new Date(r.fecha_inicio).toLocaleString()}</td>
            <td>${new Date(r.fecha_fin).toLocaleString()}</td>
            <td>${r.kilometros_recorridos}</td>
            <td>${r.incidencias_reportadas}</td>
            <td><span class="estado-${r.estado}">${r.estado}</span></td>
            <td>
              <button class="btn-editar" onclick="abrirModalEditar(${r.id_reserva})">
                Editar
              </button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById("tbody").innerHTML =
        `<tr><td colspan="8">No se pudo conectar con el servidor</td></tr>`;
    });
}

// Función para abrir el modal de editar con los datos de la reserva
function abrirModalEditar(idReserva) {
  // Obtener los datos de la reserva
  fetch(`/reservas/detalle/${idReserva}`)
    .then(res => res.json())
    .then(data => {
      if (!data.ok) {
        alert('Error al obtener los datos de la reserva');
        return;
      }

      const reserva = data.reserva;

      // Rellenar el formulario
      document.getElementById('edit_id_reserva').value = reserva.id_reserva;
      document.getElementById('edit_id_vehiculo').value = reserva.id_vehiculo;
      document.getElementById('edit_estado').value = reserva.estado;
      document.getElementById('edit_kilometros').value = reserva.kilometros_recorridos || '';
      document.getElementById('edit_incidencias').value = reserva.incidencias_reportadas || '';

      // Limpiar errores previos
      document.getElementById('errores-editar').style.display = 'none';
      document.getElementById('lista-errores-editar').innerHTML = '';

      // Abrir el modal
      const modal = new bootstrap.Modal(document.getElementById('modalEditarReserva'));
      modal.show();
    })
    .catch(err => {
      console.error('Error:', err);
      alert('Error de conexión al obtener los datos de la reserva');
    });
}

// Permitir refrescar la tabla después de crear reserva
window.agregarReservaATabla = function () {
  cargarReservas();
};