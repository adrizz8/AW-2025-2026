const express = require('express');
const router = express.Router();

const requireAdmin = require('../middlewares/requireAdmin');
const requireAuth = require('../middlewares/auth');
const db = require('../public/js/conexion');

router.get('/', requireAuth, requireAdmin, (req, res) => {

  const sql = `SELECT 
      id_usuario,
      nombre,
      correo,
      rol,
      telefono,
      id_concesionario,
      preferencias_accesibilidad,
      activo
    FROM usuarios`;

  db.query(sql, (err, resultados) => {
    if (err) {
      console.error("Error al obtener usuarios:", err);
      return res.render('usuarios', {
        titulo: "Listado de usuarios",
        usuarios: [],
        usuario: req.session.usuario,
        error: "Error al obtener los usuarios de la base de datos",
        mostrarHeader: true,
        mostrarFooter: true
      });
    }

    // Parsear campo JSON si existe
    const usuarios = resultados.map(u => ({
      ...u,
      preferencias_accesibilidad: u.preferencias_accesibilidad 
        ? JSON.parse(u.preferencias_accesibilidad)
        : {}
    }));

    res.render('usuarios', {
      titulo: "Listado de usuarios",
      usuarios,
      usuario: req.session.usuario,
      error: null,
      mostrarHeader: true,
      mostrarFooter: true
    });
  });

});

// Ruta para dar de baja a un usuario
router.post('/baja/:id', requireAuth, requireAdmin, (req, res) => {
  const idUsuario = req.params.id;

  const sql = 'UPDATE usuarios SET activo = 0 WHERE id_usuario = ?';

  db.query(sql, [idUsuario], (err, resultado) => {
    if (err) {
      console.error("Error al dar de baja usuario:", err);
      return res.redirect('/usuario?error=No se pudo dar de baja el usuario');
    }

    res.redirect('/usuario');
  });
});

// Ruta para activar un usuario
router.post('/activar/:id', requireAuth, requireAdmin, (req, res) => {
  const idUsuario = req.params.id;

  const sql = 'UPDATE usuarios SET activo = 1 WHERE id_usuario = ?';

  db.query(sql, [idUsuario], (err, resultado) => {
    if (err) {
      console.error("Error al activar usuario:", err);
      return res.redirect('/usuario?error=No se pudo activar el usuario');
    }

    res.redirect('/usuario');
  });
});

module.exports = router;