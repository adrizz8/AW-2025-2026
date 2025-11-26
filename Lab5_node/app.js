// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const usuarios = require('./datos/usuarios');


// Importar los módulos de rutas
//const publicRoutes = require('./public'); // rutas públicas (inicio, login, registro)
const mainRoutes = require('./routes/routes');        // rutas principales (inicio, login, registro, logout)
const vehiculosRoutes = require('./routes/vehiculos'); // rutas relacionadas con vehículos
const reservasRoutes = require('./routes/reservas');   // rutas relacionadas con reservas
const apiRoutes = require('./routes/api');           // rutas de la API
const usuarioRoutes = require('./routes/usuario'); // rutas de usuario
const requireAuth = require('./middlewares/auth'); // 

const app = express();

app.use(cookieParser());

// --- Middleware para leer datos de formularios ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // para parsear JSON en cuerpos de petición

// --- Configuración de sesión ---
app.use(
  session({
    secret: 'clave-secreta-super-segura',
    resave: false,
    saveUninitialized: false,
  })
);


// --- Configurar EJS como motor de plantillas ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout'); // usa views/layout.ejs como plantilla base

// --- Middleware para recordar usuario ---
app.use((req, res, next) => {
  if (!req.session.usuario && req.cookies.usuarioRecordado) {
    const usuario = usuarios.find(u => u.email === req.cookies.usuarioRecordado);
    if (usuario) {
      req.session.usuario = usuario;
    }
  }
  next();
});


// --- Middleware para pasar usuario y admin a todas las vistas ---
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.admin = req.session.usuario?.rol === "admin";   // <<--- AQUÍ
  next();
});

app.use('/html/reservas.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/reservas.html'));
});

// --- Archivos estáticos (CSS, imágenes, JS, etc.) ---
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/public', publicRoutes);

// --- Rutas principales ---
// 🟢 Aquí montamos cada grupo de rutas en su prefijo
app.use('/', mainRoutes);
app.use('/vehiculos', vehiculosRoutes);
app.use('/reservar', requireAuth, reservasRoutes);
app.use('/api', apiRoutes);
app.use('/usuario', usuarioRoutes);



// --- Middleware 404 (Página no encontrada) ---
app.use((req, res) => {
  res.status(404).render('404', { mensaje: 'Página no encontrada' });
});

// --- Middleware 500 (Errores del servidor) ---
app.use((err, req, res, next) => {
  console.error('💥 Error interno:', err.stack);
  res.status(500).render('500', { mensaje: err.message });
});


// --- Iniciar el servidor ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor Express iniciado en http://localhost:${PORT}`);
});
