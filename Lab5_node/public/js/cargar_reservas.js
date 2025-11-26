 function cargarReservas() {
    fetch('/api/reservas')
      .then(res => res.json())
      .then(reservas => {

        const tbody = document.getElementById('tbody');
        tbody.innerHTML = '';

        if (reservas.length === 0) {
          tbody.innerHTML = `<tr><td colspan="9">No hay reservas.</td></tr>`;
          return;
        }

        reservas.forEach(r => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${r.nombre}</td>
            <td>${r.email}</td>
            <td>${r.telefono}</td>
            <td>${r.tipo_vehiculo}</td>
            <td>${r.fecha_inicio}</td>
            <td>${r.hora_inicio}</td>
            <td>${r.fecha_fin}</td>
            <td>${r.hora_fin}</td>
            <td>${r.fecha_reserva}</td>
          `;
          tbody.appendChild(tr);
        });
      });
  }

  cargarReservas();