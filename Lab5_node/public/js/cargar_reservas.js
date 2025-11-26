let reservasGlobales = []; // Guardar todas las reservas

function cargarReservas() {
    const tbody = document.getElementById("tbody");
    tbody.innerHTML = "<tr><td colspan='10'>Cargando...</td></tr>";

    fetch("/api/reservas")
        .then(r => {
            if (!r.ok) {
                throw new Error(`Error ${r.status}: ${r.statusText}`);
            }
            return r.json();
        })
        .then(data => {
            reservasGlobales = data; // Guardar para filtrado
            renderizarReservas(data);
        })
        .catch(err => {
            console.error('Error cargando reservas:', err);
            tbody.innerHTML = "<tr><td colspan='10' style='color: red;'>Error al cargar reservas</td></tr>";
        });
}

function renderizarReservas(data) {
    const tbody = document.getElementById("tbody");
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = "<tr><td colspan='10'>No hay reservas</td></tr>";
        return;
    }

    data.forEach(r => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${r.nombre}</td>
            <td>${r.email}</td>
            <td>${r.telefono}</td>
            <td>${r.tipo_vehiculo}</td>
            <td>${r.fecha_inicio}</td>
            <td>${r.hora_inicio}</td>
            <td>${r.fecha_fin}</td>
            <td>${r.hora_fin}</td>
            <td>${new Date(r.fecha_reserva).toLocaleString()}</td>
            <td>
                <button class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarReserva(${r.id})">
                    🗑️ Eliminar
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// Función para eliminar reserva
function eliminarReserva(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
        return;
    }

    // Mostrar spinner si existe
    if (typeof mostrarSpinner === 'function') {
        mostrarSpinner(true);
    }

    fetch(`/api/reservas/${id}`, {
        method: 'DELETE'
    })
    .then(res => {
        if (typeof mostrarSpinner === 'function') {
            mostrarSpinner(false);
        }

        if (res.status === 404) {
            return res.json().then(data => {
                if (typeof mostrarMensaje === 'function') {
                    mostrarMensaje('❌ ' + data.error, 'warning');
                }
                throw new Error(data.error);
            });
        }

        if (res.status === 500) {
            throw new Error('Error interno del servidor');
        }

        if (!res.ok) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        return res.json();
    })
    .then(data => {
        if (data.ok) {
            // Eliminar de la lista global
            reservasGlobales = reservasGlobales.filter(r => r.id !== id);
            
            // Volver a renderizar
            const filtroActual = document.getElementById('filtroTipo')?.value || '';
            if (filtroActual) {
                cargarReservasFiltradas(filtroActual);
            } else {
                renderizarReservas(reservasGlobales);
            }

            if (typeof mostrarMensaje === 'function') {
                mostrarMensaje('✅ Reserva eliminada correctamente', 'success');
            }
        }
    })
    .catch(err => {
        if (typeof mostrarSpinner === 'function') {
            mostrarSpinner(false);
        }
        console.error('Error eliminando reserva:', err);
        if (typeof mostrarMensaje === 'function') {
            mostrarMensaje('❌ Error al eliminar la reserva', 'danger');
        }
    });
}

// Función para filtrar reservas por tipo
window.cargarReservasFiltradas = function(tipo) {
    if (!tipo) {
        renderizarReservas(reservasGlobales);
        return;
    }

    const filtradas = reservasGlobales.filter(r => 
        r.tipo_vehiculo.toLowerCase() === tipo.toLowerCase()
    );
    
    renderizarReservas(filtradas);
};

// Llamar al iniciar la página
cargarReservas();

// Permitir que otros scripts actualicen la tabla en vivo
window.agregarReservaATabla = function(reserva) {
    const tbody = document.getElementById("tbody");

    // Si la tabla está vacía (muestra "No hay reservas"), limpiarla
    if (tbody.children.length === 1 && tbody.children[0].children.length === 1) {
        const primeraCelda = tbody.children[0].children[0];
        if (primeraCelda.getAttribute('colspan') === '10') {
            tbody.innerHTML = "";
        }
    }

    // Agregar a la lista global
    reservasGlobales.push(reserva);

    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${reserva.nombre}</td>
        <td>${reserva.email}</td>
        <td>${reserva.telefono}</td>
        <td>${reserva.tipo_vehiculo}</td>
        <td>${reserva.fecha_inicio}</td>
        <td>${reserva.hora_inicio}</td>
        <td>${reserva.fecha_fin}</td>
        <td>${reserva.hora_fin}</td>
        <td>${new Date(reserva.fecha_reserva).toLocaleString()}</td>
        <td>
            <button class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarReserva(${reserva.id})">
                🗑️ Eliminar
            </button>
        </td>
    `;

    tbody.appendChild(tr);
};