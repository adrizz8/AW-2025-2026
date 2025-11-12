// routes/index.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// --- Datos simulados (solo usuarios aquí) ---
const usuarios = [];

// --- RUTA: / (Inicio) ---
router.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../public', 'index.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error al cargar la página de inicio');

    // Mostrar login o saludo según sesión
    if (req.session.usuario) {
      const nombreUsuario = req.session.usuario.nombre;
      const mensaje = `
        <div class="user-info">
          <p>👋 Hola, <strong>${nombreUsuario}</strong></p>
          <a class="cta" href="/logout">Cerrar sesión</a>
        </div>`;
      data = data.replace('{{MENSAJE_USUARIO}}', mensaje);
    } else {
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

// --- RUTAS DE USUARIO ---
// Registro
router.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'registro.html'));
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
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

router.post('/login', (req, res) => {
  const { email, contraseña } = req.body;
  const usuario = usuarios.find(u => u.email === email && u.contraseña === contraseña);

  if (!usuario) return res.send('❌ Credenciales incorrectas.');

  req.session.usuario = usuario;
  res.redirect('/');
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
