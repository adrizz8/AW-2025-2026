// routes.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// --- Datos simulados ---
const reservas = [];
const usuarios = []; // 🆕 Aquí se almacenan los usuarios en memoria (email único)

const tiposVehiculos = [
  'Coche', 'Moto', 'Camión', 'Autobús',
  'Bicicleta', 'Furgoneta', 'Camioneta', 'Scooter'
];

// --- RUTA: / (inicio) ---
router.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error al cargar la página de inicio');

    if (req.session.usuario) {
      // Si el usuario ha iniciado sesión
      const nombreUsuario = req.session.usuario.nombre;
      const mensaje = `
        <div class="user-info">
          <p>👋 Hola, <strong>${nombreUsuario}</strong></p>
          <a class="cta" href="/logout">Cerrar sesión</a>
        </div>`;
      data = data.replace('{{MENSAJE_USUARIO}}', mensaje);
    } else {
      // Si no hay sesión activa
      const mensaje = `
        <div class="user-info">
          <a class="cta" href="/login">Iniciar sesión</a>
          <a class="cta" href="/registro">Registrarse</a>
        </div>`;
      data = data.replace('{{MENSAJE_USUARIO}}', mensaje);
    }

    res.send(data);
  });
});


// --- RUTA: /vehiculos ---
router.get('/vehiculos', (req, res) => {
  const tipo = req.query.tipo;
  let tiposFiltrados = tiposVehiculos;

  if (tipo) {
    tiposFiltrados = tiposVehiculos.filter(t =>
      t.toLowerCase().includes(tipo.toLowerCase())
    );
  }

  if (req.query.format === 'json') {
    return res.json({
      total: tiposFiltrados.length,
      filtro: tipo || 'ninguno',
      tipos: tiposFiltrados
    });
  }

  const filePath = path.join(__dirname, 'public', 'vehiculos.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error al cargar la página');

    const listaHTML = tiposFiltrados.map(t => `<li>${t}</li>`).join('');
    const mensaje = tipo
      ? `Mostrando tipos que contienen: <strong>${tipo}</strong> (${tiposFiltrados.length} resultados)`
      : `Mostrando todos los tipos de vehículos (${tiposFiltrados.length} resultados)`;

    data = data.replace('{{MENSAJE}}', mensaje);
    data = data.replace('{{LISTA_VEHICULOS}}', listaHTML);

    res.send(data);
  });
});

// --- RUTA: /reservar ---
router.get('/reservar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reservar.html'));
});

// --- RUTA: /procesar-reserva ---
router.post('/procesar-reserva', (req, res) => {
  const datos = req.body;

  const nuevaReserva = {
    id: reservas.length + 1,
    nombre: datos.nombre,
    email: datos.email,
    telefono: datos.telefono,
    tipo_vehiculo: datos.tipo_vehiculo,
    fecha_inicio: datos.fecha_inicio,
    hora_inicio: datos.hora_inicio,
    fecha_fin: datos.fecha_fin,
    hora_fin: datos.hora_fin,
    fecha_reserva: new Date().toISOString()
  };

  reservas.push(nuevaReserva);
  console.log('✅ Nueva reserva registrada:', nuevaReserva);

  const filePath = path.join(__dirname, 'public', 'procesar-reserva.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error al cargar la página de confirmación');

    data = data
      .replace('{{ID}}', nuevaReserva.id)
      .replace('{{NOMBRE}}', nuevaReserva.nombre)
      .replace('{{EMAIL}}', nuevaReserva.email)
      .replace('{{TELEFONO}}', nuevaReserva.telefono)
      .replace('{{TIPO_VEHICULO}}', nuevaReserva.tipo_vehiculo)
      .replace('{{FECHA_INICIO}}', nuevaReserva.fecha_inicio)
      .replace('{{HORA_INICIO}}', nuevaReserva.hora_inicio)
      .replace('{{FECHA_FIN}}', nuevaReserva.fecha_fin)
      .replace('{{HORA_FIN}}', nuevaReserva.hora_fin);

    res.send(data);
  });
});

// --- RUTA: /lista_reservas ---
router.get('/lista_reservas', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'lista_reservas.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error interno del servidor');

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

    res.send(data);
  });
});

// --- RUTAS DE USUARIO ---
// Registro
router.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registro.html'));
});

router.post('/registro', (req, res) => {
  const { nombre, email, contraseña } = req.body;

  const existe = usuarios.find(u => u.email === email);
  if (existe) {
    return res.send('⚠️ El usuario ya está registrado. <a href="/login">Ir al login</a>');
  }

  usuarios.push({ nombre, email, contraseña });
  res.send('✅ Registro exitoso. <a href="/login">Iniciar sesión</a>');
});

// Login
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

router.post('/login', (req, res) => {
  const { email, contraseña } = req.body;
  const usuario = usuarios.find(u => u.email === email && u.contraseña === contraseña);

  if (!usuario) return res.send('❌ Credenciales incorrectas.');

  req.session.usuario = usuario; // 🆕 guardamos el usuario en la sesión
  res.redirect('/'); // 🆕 redirigimos al inicio para mostrar mensaje personalizado
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
