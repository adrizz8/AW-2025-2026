// routes/index.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const SALT_ROUNDS = 10;
const usuarios = require('../datos/usuarios');

// --- Crear usuario admin por defecto ---
(async () => {
  const hashedPass = await bcrypt.hash("admin123", SALT_ROUNDS);
  usuarios.push({
    nombre: "Admin",
    email: "admin@admin.com",
    contraseña: hashedPass,
    rol: "admin"
  });
  console.log("✔ Usuario admin creado por defecto");
})();

// // --- Middleware para recordar sesión ---
// router.use((req, res, next) => {
//   if (!req.session.usuario && req.cookies.usuarioRecordado) {
//     const usuario = usuarios.find(u => u.email === req.cookies.usuarioRecordado);
//     if (usuario) {
//       req.session.usuario = usuario;
//     }
//   }
//   next();
// });

// --- Ruta principal ---
router.get('/', (req, res) => {
  const authWarning = res.locals.authWarning || null;
  res.locals.authWarning = null; // Limpiar mensaje
  res.render('index', {
    titulo: 'Inicio',
    // usuario: req.session.usuario || null,
    authWarning,
    mostrarHeader: true,
    mostrarFooter: true
  });
});

// --- Registro ---
router.get('/registro', (req, res) => {
  res.render('registro', {
    titulo: 'Registro',
    error: null,
    mostrarHeader: false,
    mostrarFooter: false    
  });
});

router.post('/registro', async (req, res) => {
  const { nombre, email, contraseña, telefono, concesionario } = req.body;
  const existe = usuarios.find(u => u.email === email);

  if (existe) {
    return res.render('registro', {
      titulo: 'Registro',
      error: '⚠️ El usuario ya está registrado.',
      mostrarHeader: false,
      mostrarFooter: false     
    });
  }

  const hash = await bcrypt.hash(contraseña, SALT_ROUNDS);
  usuarios.push({ nombre, email, contraseña: hash, telefono, concesionario, rol: "usuario" });
  res.redirect('/login');
});


// --- Login ---
router.get('/login', (req, res) => {
  res.render('login', {
    titulo: 'Iniciar sesión',
    error: null,
    mostrarHeader: false,
    mostrarFooter: false
  });
});

router.post('/login', async (req, res) => {
  const { email, contraseña, recordar } = req.body;
  const usuario = usuarios.find(u => u.email === email);

  if (!usuario) {
    return res.render('login', {
      titulo: 'Iniciar sesión',
      error: '❌ Usuario no encontrado.',
      mostrarHeader: false,
      mostrarFooter: false
    });
  }

  const esValida = await bcrypt.compare(contraseña, usuario.contraseña);
  if (!esValida) {
    return res.render('login', {
      titulo: 'Iniciar sesión',
      error: '❌ Contraseña incorrecta.',
      mostrarHeader: false,
      mostrarFooter: false,
    });
  }

  // Guardar usuario en sesión
  req.session.usuario = usuario;

  // Guardar cookie si el usuario quiere "recordar sesión"
  if (recordar) {
    res.cookie("usuarioRecordado", usuario.email, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
      httpOnly: true
    });
  }

  res.redirect('/');
});

// --- Logout ---
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('usuarioRecordado'); // Limpiar cookie al salir
    res.redirect('/');
  });
});

module.exports = router;
