const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url'); 

// Lista de tipos de vehículos
const tiposVehiculos = [
    'Coche',
    'Moto',
    'Camión',
    'Autobús',
    'Bicicleta',
    'Furgoneta',
    'Camioneta',
    'Scooter'
];

let servidor = http.createServer(function(request, response){
    const parsedUrl = url.parse(request.url, true); // true para obtener query como objeto
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
    let filePath = '';

    console.log('Ruta solicitada:', pathname);

    if (pathname === '/') {
        filePath = path.join(__dirname, 'public', 'index.html');
        
        fs.readFile(filePath, function(error, data){
            if (error) {
                response.writeHead(500);
                response.end('Error interno del servidor');
            } else {
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(data);
            }
        });
    }

    else if (pathname === '/reservar') {
        filePath = path.join(__dirname, 'public', 'reservar.html');
        
        fs.readFile(filePath,'utf8', function(error, data){
            if (error) {
                response.writeHead(500);
                response.end('Error interno del servidor');
            } else {
                response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                response.end(data);
            }
        });
    }

    else if (pathname === '/vehiculos') {
        // Filtrar tipos de vehículos según el parámetro 'tipo'
        let tiposFiltrados = tiposVehiculos;
        
        if (query.tipo) {
            tiposFiltrados = tiposVehiculos.filter(t => 
                t.toLowerCase().includes(query.tipo.toLowerCase())
            );
        }

        // Si se pide JSON
        if (query.format === 'json') {
            response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
            response.end(JSON.stringify({
                total: tiposFiltrados.length,
                filtro: query.tipo || 'ninguno',
                tipos: tiposFiltrados
            }, null, 2));
        } else {
            // Devolver HTML
            filePath = path.join(__dirname, 'public', 'vehiculos.html');
            
            fs.readFile(filePath, 'utf8', function(error, data){
                if (error) {
                    response.writeHead(500);
                    response.end('Error interno del servidor');
                } else {
                    // Crear lista HTML
                    let listaHTML = tiposFiltrados.map(tipo => 
                        `<li>${tipo}</li>`
                    ).join('');
                    
                    let mensaje = query.tipo 
                        ? `Mostrando tipos que contienen: <strong>${query.tipo}</strong> (${tiposFiltrados.length} resultados)`
                        : `Mostrando todos los tipos de vehículos (${tiposFiltrados.length} resultados)`;
                    
                    // Reemplazar marcadores en el HTML
                    data = data.replace('{{MENSAJE}}', mensaje);
                    data = data.replace('{{LISTA_VEHICULOS}}', listaHTML);
                    
                    response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                    response.end(data);
                }
            });
        }
    }

    else if (pathname === '/procesar-reserva' && request.method === 'POST') {
        let body = '';
        
        request.on('data', function(chunk) {
            body += chunk.toString();
        });
        
        request.on('end', function() {
            const datosReserva = querystring.parse(body);
            
            // Crear objeto de reserva
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
            
            // Guardar la reserva
            reservas.push(nuevaReserva);
            
            console.log('Nueva reserva registrada:', nuevaReserva);
            
            // Leer el template de confirmación
            filePath = path.join(__dirname, 'public', 'confirmacion.html');
            
            fs.readFile(filePath, 'utf8', function(error, data){
                if (error) {
                    response.writeHead(500);
                    response.end('Error al cargar la página de confirmación');
                } else {
                    // Reemplazar los placeholders con los datos de la reserva
                    data = data.replace('{{ID}}', nuevaReserva.id);
                    data = data.replace('{{NOMBRE}}', nuevaReserva.nombre);
                    data = data.replace('{{EMAIL}}', nuevaReserva.email);
                    data = data.replace('{{TELEFONO}}', nuevaReserva.telefono);
                    data = data.replace('{{TIPO_VEHICULO}}', nuevaReserva.tipo_vehiculo.charAt(0).toUpperCase() + nuevaReserva.tipo_vehiculo.slice(1));
                    data = data.replace('{{FECHA_INICIO}}', nuevaReserva.fecha_inicio);
                    data = data.replace('{{HORA_INICIO}}', nuevaReserva.hora_inicio);
                    data = data.replace('{{FECHA_FIN}}', nuevaReserva.fecha_fin);
                    data = data.replace('{{HORA_FIN}}', nuevaReserva.hora_fin);
                    
                    response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                    response.end(data);
                }
            });
        });
    }

    else {
        // Rutas no encontradas
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        console.log('Ruta solicitada:', pathname);
        response.end('404 - Página no encontrada');
    }
});

servidor.listen(3000, function(error){
    if(error)
        console.log('Ha ocurrido un error al iniciar el servidor');
    else
        console.log('Servidor iniciado en el puerto 3000');
});