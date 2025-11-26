

  function mostrarSpinner(mostrar) {
    const spinner = document.getElementById('spinner');
    if (mostrar) {
      spinner.classList.add('active');
    } else {
      spinner.classList.remove('active');
    }
  }

  async function cargarVehiculos(query = '', tipo = '') {
    const tbody = document.getElementById('vehiculos-body');
    tbody.innerHTML = '<tr><td colspan="7">Cargando...</td></tr>';

    mostrarSpinner(true);

    try {
      let url = '/api/vehiculos?';
      if (query) url += 'q=' + encodeURIComponent(query);
      if (tipo) url += '&tipo=' + encodeURIComponent(tipo);

      const res = await fetch(url);

      if (res.status === 500) {
        throw new Error('Error interno del servidor (500)');
      }

      if (res.status === 404) {
        throw new Error('Endpoint no encontrado (404)');
      }

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const vehiculos = await res.json();

      mostrarSpinner(false);

      if (!vehiculos.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No se encontraron vehículos.</td></tr>';
        return;
      }

      tbody.innerHTML = '';
      vehiculos.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${v.id}</td>
          <td>${v.marca}</td>
          <td>${v.modelo}</td>
          <td>${v.tipo}</td>
          <td>${v.precioHora}€</td>
          <td>
            <a href="/vehiculos/${v.id}">Ver</a>
            ${esAdmin ? ` | <a href="/vehiculos/${v.id}/editar">Editar</a>` : ''}
          </td>
          <td>
            <img src="${v.imagen}" alt="Imagen ${v.marca}" style="width:120px;border-radius:8px;">
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      mostrarSpinner(false);
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:red;">Error: ${err.message}</td></tr>`;
      console.error(err);
    }
  }

  function aplicarFiltros() {
    const query = document.getElementById('q').value;
    const tipo = document.getElementById('filtroTipo').value;
    cargarVehiculos(query, tipo);
  }

  // Cargar al iniciar
  cargarVehiculos();

  // Enter en el input de búsqueda
  document.getElementById('q').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      aplicarFiltros();
    }
  });

  // Cambio en el select de tipo
  document.getElementById('filtroTipo').addEventListener('change', function() {
    aplicarFiltros();
  });