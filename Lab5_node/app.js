// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const routes = require('./routes');

const app = express();

// Para poder leer datos de formularios (req.body)
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión
app.use(
  session({
    secret: 'clave-secreta-super-segura',
    resave: false,
    saveUninitialized: false,
  })
);

// ✅ Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // carpeta "views" para las plantillas

// ⚠️ Primero las rutas dinámicas
app.use('/', routes);

// ✅ Luego los archivos estáticos (CSS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// --- Middleware 404 (Página no encontrada) ---
app.use((req, res) => {
  res.status(404).render('404');
});

// --- Middleware 500 (Errores del servidor) ---
app.use((err, req, res, next) => {
  console.error('💥 Error interno:', err.stack);
  res.status(500).render('error', { mensaje: err.message });
});


// Servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor Express iniciado en http://localhost:${PORT}`);
});
