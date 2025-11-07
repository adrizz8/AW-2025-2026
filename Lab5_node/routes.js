// routes.js
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

// Datos compartidos
const reservas = [];

const tiposVehiculos = [
    'Coche', 'Moto', 'Camión', 'Autobús',
    'Bicicleta', 'Furgoneta', 'Camioneta', 'Scooter'
];

// Función manejadora de rutas
function manejarRutas(request, response) {
    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    let filePath = '';
    console.log(`📥 Ruta solicitada: ${pathname} - Método: ${request.method}`);

    // --- RUTA: /
    if (pathname === '/') {
        filePath = path.join(__dirname, 'public', 'index.html');
        return servirArchivo(filePath, 'text/html', response);
    }

    // --- RUTA: /reservar
    else if (pathname === '/reservar') {
        filePath = path.join(__dirname, 'public', 'reservar.html');
        return servirArchivo(filePath, 'text/html; charset=utf-8', response);
    }

    // --- RUTA: /vehiculos
    else if (pathname === '/vehiculos') {
        let tiposFiltrados = tiposVehiculos;

        if (query.tipo) {
            tiposFiltrados = tiposVehiculos.filter(t =>
                t.toLowerCase().includes(query.tipo.toLowerCase())
            );
        }

        if (query.format === 'json') {
            response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            response.end(JSON.stringify({
                total: tiposFiltrados.length,
                filtro: query.tipo || 'ninguno',
                tipos: tiposFiltrados
            }, null, 2));
        } else {
            filePath = path.join(__dirname, 'public', 'vehiculos.html');
            fs.readFile(filePath, 'utf8', function (error, data) {
                if (error) {
                    response.writeHead(500);
                    response.end('Error interno del servidor');
                } else {
                    const listaHTML = tiposFiltrados.map(tipo => `<li>${tipo}</li>`).join('');
                    const mensaje = query.tipo
                        ? `Mostrando tipos que contienen: <strong>${query.tipo}</strong> (${tiposFiltrados.length} resultados)`
                        : `Mostrando todos los tipos de vehículos (${tiposFiltrados.length} resultados)`;

                    data = data.replace('{{MENSAJE}}', mensaje);
                    data = data.replace('{{LISTA_VEHICULOS}}', listaHTML);

                    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    response.end(data);
                }
            });
        }
    }

    // --- RUTA: /procesar-reserva
    else if (pathname === '/procesar-reserva') {
        if (request.method === 'POST') {
            let body = '';
            request.on('data', chunk => body += chunk.toString());

            request.on('end', () => {
                const datosReserva = querystring.parse(body);
                const nuevaReserva = {
                    id: reservas.length + 1,
                    nombre: datosReserva.nombre,
                    email: datosReserva.email,
                    telefono: datosReserva.telefono,
                    tipo_vehiculo: datosReserva.tipo_vehiculo,
                    fecha_inicio: datosReserva.fecha_inicio,
                    hora_inicio: datosReserva.hora_inicio,
                    fecha_fin: datosReserva.fecha_fin,
                    hora_fin: datosReserva.hora_fin,
                    fecha_reserva: new Date().toISOString()
                };

                reservas.push(nuevaReserva);
                console.log('✅ Nueva reserva registrada:', nuevaReserva);

                filePath = path.join(__dirname, 'public', 'procesar-reserva.html');
                fs.readFile(filePath, 'utf8', (error, data) => {
                    if (error) {
                        response.writeHead(500);
                        response.end('Error al cargar la página de confirmación');
                    } else {
                        data = data
                            .replace('{{ID}}', nuevaReserva.id)
                            .replace('{{NOMBRE}}', nuevaReserva.nombre)
                            .replace('{{EMAIL}}', nuevaReserva.email)
                            .replace('{{TELEFONO}}', nuevaReserva.telefono)
                            .replace('{{TIPO_VEHICULO}}', nuevaReserva.tipo_vehiculo.charAt(0).toUpperCase() + nuevaReserva.tipo_vehiculo.slice(1))
                            .replace('{{FECHA_INICIO}}', nuevaReserva.fecha_inicio)
                            .replace('{{HORA_INICIO}}', nuevaReserva.hora_inicio)
                            .replace('{{FECHA_FIN}}', nuevaReserva.fecha_fin)
                            .replace('{{HORA_FIN}}', nuevaReserva.hora_fin);

                        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        response.end(data);
                    }
                });
            });
        } else {
            response.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end('405 - Método no permitido');
        }
    }

    // --- RUTA: /lista_reservas
    else if (pathname === '/lista_reservas') {
        filePath = path.join(__dirname, 'public', 'lista_reservas.html');
        fs.readFile(filePath, 'utf8', function (error, data) {
            if (error) {
                response.writeHead(500);
                response.end('Error interno del servidor');
            } else {
                let reservasHTML = reservas.length
                    ? reservas.map(r => `
                        <div class="reserva-item">
                            <strong>Reserva #${r.id}</strong><br>
                            Cliente: ${r.nombre}<br>
                            Email: ${r.email}<br>
                            Vehículo: ${r.tipo_vehiculo}<br>
                            Desde: ${r.fecha_inicio} ${r.hora_inicio}<br>
                            Hasta: ${r.fecha_fin} ${r.hora_fin}
                        </div>
                    `).join('')
                    : '<p style="text-align:center; color:#666;">No hay reservas registradas aún.</p>';

                data = data.replace('{{RESERVAS}}', reservasHTML);
                data = data.replace('{{TOTAL}}', reservas.length);

                response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                response.end(data);
            }
        });
    }

    // --- RUTA: /styles.css
    else if (pathname === '/styles.css') {
        filePath = path.join(__dirname, 'public', 'styles.css');
        return servirArchivo(filePath, 'text/css', response);
    }

    // --- RUTA NO ENCONTRADA
    else {
        const notFoundPath = path.join(__dirname, 'public', '404.html');
        fs.readFile(notFoundPath, (error, data) => {
            if (error) {
                response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                response.end('404 - Página no encontrada');
            } else {
                response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                response.end(data);
            }
        });
    }
}

// Función auxiliar para servir archivos estáticos
function servirArchivo(ruta, tipo, response) {
    fs.readFile(ruta, function (error, data) {
        if (error) {
            response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end('Error interno del servidor');
        } else {
            response.writeHead(200, { 'Content-Type': tipo });
            response.end(data);
        }
    });
}

module.exports = manejarRutas;
