// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const routes = require('./routes');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'clave-secreta-super-segura',
    resave: false,
    saveUninitialized: false,
  })
);

// ⚠️ Primero las rutas dinámicas
app.use('/', routes);

// ✅ Luego los archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor Express iniciado en http://localhost:${PORT}`);
});
