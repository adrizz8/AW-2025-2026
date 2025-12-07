// Con esto manejamos el envio del formulario de edicion de reserva
document.getElementById('form-editar-reserva').addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = new FormData(this);
  const datos = Object.fromEntries(formData);

  // Limpiamos posibles errores nuevos
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
      // Mostramos los errores que salgan
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

    // Si no quedan errores mostramos la tabla y cerramos el modal de edicion de reservas
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