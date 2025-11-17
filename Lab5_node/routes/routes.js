// routes/index.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;   

const router = express.Router();

// --- Datos simulados (solo usuarios aquí) ---
const usuarios = [];

// --- RUTA: / (Inicio) ---
router.get('/', (req, res) => {
  const authWarning = res.locals.authWarning || null;
  req.session.authWarning = null; // Limpiar el mensaje después de mostrarlo una vez
  res.render('index', {
    authWarning,
    titulo: 'Inicio',
    usuario: req.session.usuario || null
  });
});


// --- RUTAS DE USUARIO ---
// Registro
// --- RUTAS DE USUARIO ---

// Registro (GET)
router.get('/registro', (req, res) => {
  res.render('registro', {
    titulo: 'Registro',
    error: null
  });
});

// Registro (POST)
// Registro (POST)
router.post('/registro', async (req, res) => {
  const { nombre, email, contraseña } = req.body;

  const existe = usuarios.find(u => u.email === email);

  if (existe) {
    return res.render('registro', {
      titulo: 'Registro',
      error: '⚠️ El usuario ya está registrado.'
    });
  }

  // Hash contraseña
  const hash = await bcrypt.hash(contraseña, SALT_ROUNDS);

  usuarios.push({ 
    nombre, 
    email, 
    contraseña: hash,
    rol: "usuario"   // por defecto todos son usuarios normales
  });

  res.redirect('/login');
});



// Login (GET)
router.get('/login', (req, res) => {
  res.render('login', {
    titulo: 'Iniciar sesión',
    error: null
  });
});

// Login (POST)
// Login (POST)
router.post('/login', async (req, res) => {
  const { email, contraseña } = req.body;

  const usuario = usuarios.find(u => u.email === email);

  if (!usuario) {
    return res.render('login', {
      titulo: 'Iniciar sesión',
      error: '❌ Usuario no encontrado.'
    });
  }

  // Comprobar contraseña hasheada
  const esValida = await bcrypt.compare(contraseña, usuario.contraseña);

  if (!esValida) {
    return res.render('login', {
      titulo: 'Iniciar sesión',
      error: '❌ Contraseña incorrecta.'
    });
  }

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
