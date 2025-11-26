 document.getElementById('form-reserva').addEventListener('submit', function (e) {
    e.preventDefault();

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

    fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reserva)
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { status: res.status, data: data };
        });
      })
      .then(function (result) {
        const mensaje = document.getElementById('mensaje');

        if (result.status === 200) {
          mensaje.innerHTML = '<p style="color: green;">Reserva realizada correctamente</p>';
          document.getElementById('form-reserva').reset();
        } else {
          mensaje.innerHTML = '<p style="color: red;">Error: ' + result.data.error + '</p>';
        }
      })
      .catch(function (err) {
        console.error('Error en la petición:', err);
        document.getElementById('mensaje').innerHTML =
          '<p style="color: red;">Error al conectar con el servidor</p>';
      });
  });

  // Fecha mínima = hoy
  var hoy = new Date().toISOString().split('T')[0];
  document.getElementById('fecha_inicio').setAttribute('min', hoy);
  document.getElementById('fecha_fin').setAttribute('min', hoy);

