require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');

// Importar los módulos de rutas
const mainRoutes = require('./routes/routes');
const vehiculosRoutes = require('./routes/vehiculos');
const reservasRoutes = require('./routes/reservas');
const concesionariosRoutes = require('./routes/concesionarios');
const apiRoutes = require('./routes/api');
const usuarioRoutes = require('./routes/usuario');
const cargadoresRoutes = require('./routes/cargadores');
const setUpRoutes = require('./routes/setup');

// Importar middlewares
const requireAuth = require('./middlewares/auth');
const requireAdmin = require('./middlewares/requireAdmin');
const checkDatabase = require('./middlewares/checkDatabase'); 

const app = express();

app.use(cookieParser());

// --- Middleware para leer datos de formularios ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Configuración de sesión ---
app.use(
  session({
    secret: 'clave-secreta-super-segura',
    resave: false,
    saveUninitialized: false,
  })
);



// --- Configurar EJS ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// --- Middleware para recordar usuario ---
app.use((req, res, next) => {
  if (!req.session.usuario && req.cookies.usuarioRecordado) {
    const db = require('./public/js/conexion');
    db.query('SELECT * FROM usuarios WHERE correo = ?', [req.cookies.usuarioRecordado], (err, usuarios) => {
      if (!err && usuarios.length > 0) {
        const { contraseña, ...usuarioSinPassword } = usuarios[0];
        req.session.usuario = usuarioSinPassword;
      }
      next();
    });
  } else {
    next();
  }
});

// --- Middleware para pasar usuario y admin a vistas ---
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.admin = req.session.usuario?.rol === "admin";
  next();
});


// --- Archivos estáticos ---
app.use(express.static(path.join(__dirname, 'public')));



app.use('/setup', setUpRoutes);
app.use('/',checkDatabase, mainRoutes);
app.use('/vehiculos',checkDatabase, vehiculosRoutes);
app.use('/reservas',checkDatabase, requireAuth, reservasRoutes);
app.use('/concesionarios',checkDatabase, requireAdmin, concesionariosRoutes);
app.use('/api',checkDatabase, apiRoutes);
app.use('/usuario',checkDatabase, usuarioRoutes);
app.use('/api/chargers',checkDatabase, cargadoresRoutes);

// --- Middleware 404 ---
app.use((req, res) => {
  res.status(404).render('404', { mensaje: 'Página no encontrada' });
});

// --- Middleware 500 ---
app.use((err, req, res, next) => {
  console.error('💥 Error interno:', err.stack);
  res.status(500).render('500', { mensaje: err.message });
});

// --- Iniciar servidor ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor Express iniciado en http://localhost:${PORT}`);
});
