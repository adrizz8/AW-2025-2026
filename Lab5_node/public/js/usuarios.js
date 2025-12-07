document.addEventListener('DOMContentLoaded', () => {
  const modalEl = document.getElementById('modalEditarUsuario');
  const bsModal = new bootstrap.Modal(modalEl);
  const erroresDiv = document.getElementById('errores-editar-usuario');

  function mostrarErrores(lista) {
    erroresDiv.innerHTML = '';
    if (!lista || lista.length === 0) {
      erroresDiv.style.display = 'none';
      return;
    }
    const ul = document.createElement('ul');
    lista.forEach(msg => {
      const li = document.createElement('li');
      li.textContent = msg;
      ul.appendChild(li);
    });
    erroresDiv.appendChild(ul);
    erroresDiv.style.display = 'block';
  }

  // Abrir modal al pulsar "Editar"
  document.querySelectorAll('.btn-editar-usuario').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = btn.dataset.id;

      mostrarErrores([]);

      const res = await fetch(`/usuario/datos/${id}`);
      const data = await res.json();
      if (!data.ok) {
        alert(data.error || 'Error al cargar usuario');
        return;
      }

      const u = data.usuario;
      const conces = data.concesionarios;

      // Rellenar campos
      document.getElementById('edit-id_usuario').value = u.id_usuario;
      document.getElementById('edit-nombre').value = u.nombre;
      document.getElementById('edit-correo').value = u.correo;
      document.getElementById('edit-telefono').value = u.telefono || '';
      document.getElementById('edit-rol').value = u.rol;

      const selectConc = document.getElementById('edit-id_concesionario');
      selectConc.innerHTML = '<option value="">Sin concesionario</option>';
      conces.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id_concesionario;
        opt.textContent = c.nombre;
        if (u.id_concesionario === c.id_concesionario) opt.selected = true;
        selectConc.appendChild(opt);
      });

      bsModal.show();
    });
  });

  // Guardar cambios
  document.getElementById('btn-guardar-usuario').addEventListener('click', async () => {
    const id = document.getElementById('edit-id_usuario').value;
    const payload = {
      nombre: document.getElementById('edit-nombre').value,
      correo: document.getElementById('edit-correo').value,
      telefono: document.getElementById('edit-telefono').value,
      rol: document.getElementById('edit-rol').value,
      id_concesionario: document.getElementById('edit-id_concesionario').value
    };

    const res = await fetch(`/usuario/editar/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.ok) {
      mostrarErrores(data.errores || ['Error al actualizar usuario']);
      return;
    }

    // recargar la página para ver cambios (o actualizar la fila a mano)
    bsModal.hide();
    location.reload();
  });
});
