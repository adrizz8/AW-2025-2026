let vehiculosConflicto = [];

// Función que usamos para mostrar todos los logs relativos a las nuevas inserciones
function mostrarLogs(logs) {
  const logsContainer = document.getElementById('logs-container');
  const logsContent = document.getElementById('logs-content');

  logsContent.innerHTML = '';
  logs.forEach(log => {
    const div = document.createElement('div');
    div.className = 'log-item';

    if (log.includes('✔')) div.classList.add('log-success');
    else if (log.includes('❌')) div.classList.add('log-error');
    else if (log.includes('⚠')) div.classList.add('log-warning');
    else if (log.includes('🔁')) div.classList.add('log-update');

    div.textContent = log;
    logsContent.appendChild(div);
  });

  logsContainer.classList.add('show');
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

// Función para mostrar las estadisticas con un grid
function mostrarEstadisticas(stats) {
  document.getElementById('estadisticas').style.display = 'grid';
  document.getElementById('stat-total').textContent = stats.total || 0;
  document.getElementById('stat-exitosos').textContent = stats.añadidos || stats.exitosos || 0;
  document.getElementById('stat-actualizados').textContent = stats.actualizados || 0;
  document.getElementById('stat-errores').textContent = stats.errores || 0;
}

// Función para mostrar conflictos de las inserciones
function mostrarConflictos(conflictos) {
  const container = document.getElementById('conflictos-container');
  const listaConflictos = document.getElementById('lista-conflictos');

  listaConflictos.innerHTML = '';
  conflictos.forEach(conflicto => {
    const div = document.createElement('div');
    div.className = 'conflicto-item';
    div.innerHTML = `<strong>${conflicto.marca} ${conflicto.modelo}</strong> - Matrícula: ${conflicto.matricula}`;
    listaConflictos.appendChild(div);
  });

  container.classList.add('show');
}

//Mostramos el boton que redirige a index en caso de haber poblado ya nuestra base de datos de vehiculos y concesionarios
function mostrarBotonIndex() {
  const btnContainer = document.getElementById('btn-ir-index-container');
  btnContainer.style.display = 'block';

  const btn = document.getElementById('btn-ir-index');
  btn.addEventListener('click', () => {
    window.location.href = '/'; 
  });
}

// Manejamos la carga del json correspondiente a los datos de los concesionarios
document.getElementById('form-concesionarios').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const btn = document.getElementById('btn-concesionarios');

  btn.classList.add('loading');
  btn.disabled = true;

  fetch('/setup/cargar-concesionarios', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      mostrarLogs(data.logs);
      mostrarEstadisticas(data.estadisticas || {
        total: data.total,
        exitosos: data.exitosos,
        errores: data.errores,
        actualizados: 0
      });

      if (data.ok) {
        alert('✅ ' + data.mensaje);
        this.reset();
      } else {
        alert('❌ ' + data.error);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('❌ Error al procesar el archivo');
    })
    .finally(() => {
      btn.classList.remove('loading');
      btn.disabled = false;
    });
});

// // Manejamos la carga del json correspondiente a los datos de los vehiculos
document.getElementById('form-vehiculos').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const btn = document.getElementById('btn-vehiculos');

  btn.classList.add('loading');
  btn.disabled = true;

  fetch('/setup/cargar-vehiculos', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      mostrarLogs(data.logs);

      if (data.requiereConfirmacion) {
        vehiculosConflicto = data.vehiculosConflicto;
        mostrarConflictos(data.vehiculosConflicto);
        mostrarEstadisticas(data.estadisticas);
      } else {
        mostrarEstadisticas(data.estadisticas);

        if (data.ok) {
          alert('✅ ' + data.mensaje);
          this.reset();
          // Mostrar botón para ir a index
          mostrarBotonIndex();
        } else {
          alert('❌ ' + data.error);
        }
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('❌ Error al procesar el archivo');
    })
    .finally(() => {
      btn.classList.remove('loading');
      btn.disabled = false;
    });
});

// Actualizamos todos los vehículos con conflicto
document.getElementById('btn-actualizar-todos').addEventListener('click', function() {
  if (vehiculosConflicto.length === 0) return;

  this.disabled = true;
  this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Actualizando...';

  const vehiculosParaActualizar = vehiculosConflicto.map(v => v.datos);

  fetch('/setup/actualizar-vehiculos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vehiculos: vehiculosParaActualizar })
  })
    .then(response => response.json())
    .then(data => {
      mostrarLogs(data.logs);
      mostrarEstadisticas(data.estadisticas);

      if (data.ok) {
        alert('✅ ' + data.mensaje);
        document.getElementById('conflictos-container').classList.remove('show');
        document.getElementById('form-vehiculos').reset();
        vehiculosConflicto = [];
        // Mostrar botón para ir a index
        mostrarBotonIndex();
      } else {
        alert('❌ ' + data.error);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('❌ Error al actualizar vehículos');
    })
    .finally(() => {
      this.disabled = false;
      this.innerHTML = 'Actualizar todos';
    });
});

// Boton para cancelar la actualizacion de los vehiculos
document.getElementById('btn-cancelar').addEventListener('click', function() {
  document.getElementById('conflictos-container').classList.remove('show');
  vehiculosConflicto = [];
});
