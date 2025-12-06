
document.addEventListener("DOMContentLoaded", cargarReservas);

function cargarReservas() {
  fetch("/reservas/lista")
    .then(res => res.json())
    .then(data => {
      if (!data.ok) {
        document.getElementById("tbody").innerHTML =
          `<tr><td colspan="10">Error cargando reservas</td></tr>`;
        return;
      }

      const tbody = document.getElementById("tbody");
      tbody.innerHTML = "";

      data.reservas.forEach(r => {
        tbody.innerHTML += `
          <tr>
            <td>${r.id_reserva}</td>
            <td>${r.id_vehiculo}</td>
            <td>${r.dni_cliente}</td>
            <td>${r.nombre}</td>
            <td>${new Date(r.fecha_inicio).toLocaleString()}</td>
            <td>${new Date(r.fecha_fin).toLocaleString()}</td>
            <td>${r.estado}</td>
          </tr>
        `;
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById("tbody").innerHTML =
        `<tr><td colspan="10">No se pudo conectar con el servidor</td></tr>`;
    });
}

// Permitir refrescar la tabla después de crear reserva
window.agregarReservaATabla = function () {
  cargarReservas();
};

