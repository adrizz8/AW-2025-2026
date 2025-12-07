document.addEventListener("DOMContentLoaded", cargarReservas);

// Funcion que usamos para cargar las reservas en nuestra tabla que tiene el histórico de reservas de cada usuario
// La carga se realiza mediante un fetch a la ruta especificada y si hay reservas las mostramos en nuestra tabla
// sino devolvemos un error en la propia tabla
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

// Función que usamos para abrir el modal de edición de datos de la reserva, también mediante fetch y con un alert en caso de no obtener los datos de la reserva
function abrirModalEditar(idReserva) {

  fetch(`/reservas/detalle/${idReserva}`)
    .then(res => res.json())
    .then(data => {
      if (!data.ok) {
        alert('Error al obtener los datos de la reserva');
        return;
      }

      const reserva = data.reserva;

     
      document.getElementById('edit_id_reserva').value = reserva.id_reserva;
      document.getElementById('edit_id_vehiculo').value = reserva.id_vehiculo;
      document.getElementById('edit_estado').value = reserva.estado;
      document.getElementById('edit_kilometros').value = reserva.kilometros_recorridos || '';
      document.getElementById('edit_incidencias').value = reserva.incidencias_reportadas || '';

      // Usamos esto para limpiar los errores del formulario
      document.getElementById('errores-editar').style.display = 'none';
      document.getElementById('lista-errores-editar').innerHTML = '';

    
      const modal = new bootstrap.Modal(document.getElementById('modalEditarReserva'));
      modal.show();
    })
    .catch(err => {
      console.error('Error:', err);
      alert('Error de conexión al obtener los datos de la reserva');
    });
}

// Refrescamos la tabla tras agregar la reserva
window.agregarReservaATabla = function () {
  cargarReservas();
};