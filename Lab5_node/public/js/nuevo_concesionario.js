
//Aqui tratamos todo lo relativo al formulario usado para la creacion de un nuevo concesionario
document.getElementById('btn-agregar-concesionario').addEventListener('click', async () => {
  const nombre = document.getElementById('nombre').value;
  const ciudad = document.getElementById('ciudad').value;
  const direccion = document.getElementById('direccion').value;
  const telefono_contacto = document.getElementById('telefono_contacto').value;
  const erroresDiv = document.getElementById('errores-concesionario');

  erroresDiv.style.display = 'none';
  erroresDiv.innerHTML = '';

  //Hacemos un fetch de tipo post para intentar enviar los datos del formulario
  try {
    const res = await fetch('/concesionarios/nuevo', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ nombre, ciudad, direccion, telefono_contacto })
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      const lista = document.createElement('ul');
      (data.errores || ['Error al añadir concesionario']).forEach(msg => {
        const li = document.createElement('li');
        li.textContent = msg;
        lista.appendChild(li);
      });
      erroresDiv.appendChild(lista);
      erroresDiv.style.display = 'block';
      return;
    }

    // Si no tenemos errores cargamos la lista y cerramos el modal
    const modalEl = document.getElementById('modalNuevoConcesionario');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
    location.reload();

  } catch (e) {
    console.error(e);
    erroresDiv.textContent = 'Error al añadir concesionario.';
    erroresDiv.style.display = 'block';
  }
});
