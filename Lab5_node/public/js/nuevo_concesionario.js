document.getElementById('btn-agregar-concesionario').addEventListener('click', async () => {
  const nombre = document.getElementById('nombre').value;
  const ciudad = document.getElementById('ciudad').value;
  const direccion = document.getElementById('direccion').value;
  const telefono_contacto = document.getElementById('telefono_contacto').value;

  const res = await fetch('/concesionarios/nuevo', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ nombre, ciudad, direccion, telefono_contacto })
  });

  if (res.ok) {
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevoConcesionario'));
    modal.hide();

    // Opcional: agregar nuevo concesionario a la tabla dinámicamente
    const tbody = document.querySelector('.tabla-concesionarios tbody');
    const row = document.createElement('tr');
    row.innerHTML = `<td>Nuevo</td><td>${nombre}</td><td>${ciudad}</td><td>${direccion}</td><td>${telefono_contacto}</td>`;
    tbody.appendChild(row);
  } else {
    alert('Error al añadir concesionario');
  }
});
