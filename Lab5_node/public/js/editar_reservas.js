// Manejar el envío del formulario de edición
document.getElementById('form-editar-reserva').addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = new FormData(this);
  const datos = Object.fromEntries(formData);

  // Limpiar errores previos
  document.getElementById('errores-editar').style.display = 'none';
  document.getElementById('lista-errores-editar').innerHTML = '';

  fetch(`/reservas/editar/${datos.id_reserva}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  })
  .then(res => res.json())
  .then(data => {
    if (!data.ok) {
      // Mostrar errores
      if (data.errores && data.errores.length > 0) {
        const listaErrores = document.getElementById('lista-errores-editar');
        listaErrores.innerHTML = '';
        
        data.errores.forEach(error => {
          const li = document.createElement('li');
          li.textContent = error;
          listaErrores.appendChild(li);
        });

        document.getElementById('errores-editar').style.display = 'block';
      } else {
        alert(data.error || 'Error al actualizar la reserva');
      }
      return;
    }

    // Éxito: cerrar modal y recargar tabla
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarReserva'));
    modal.hide();
    
    alert('Reserva actualizada correctamente');
    cargarReservas();
  })
  .catch(err => {
    console.error('Error:', err);
    alert('Error de conexión al actualizar la reserva');
  });
});