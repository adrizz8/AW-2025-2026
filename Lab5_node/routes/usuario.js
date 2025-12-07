const express = require('express');
const router = express.Router();

const requireAdmin = require('../middlewares/requireAdmin');
const requireAuth = require('../middlewares/auth');
const db = require('../public/js/conexion');

router.get('/', requireAuth, requireAdmin, (req, res) => {

const sql = `
    SELECT 
      u.id_usuario,
      u.nombre,
      u.correo,
      u.rol,
      u.telefono,
      u.id_concesionario,
      u.preferencias_accesibilidad,
      u.activo,
      c.nombre AS nombre_concesionario
    FROM usuarios u
    LEFT JOIN concesionarios c
      ON u.id_concesionario = c.id_concesionario
  `;

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

router.get('/datos/:id', requireAuth, requireAdmin, (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT 
      u.id_usuario,
      u.nombre,
      u.correo,
      u.telefono,
      u.rol,
      u.id_concesionario
    FROM usuarios u
    WHERE u.id_usuario = ?
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error("Error al obtener usuario:", err);
      return res.status(500).json({ ok: false, error: 'Error al obtener usuario' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }

    // también necesitas la lista de concesionarios para el <select>
    db.query(
      'SELECT id_concesionario, nombre FROM concesionarios WHERE activo = 1 ORDER BY nombre ASC',
      (err2, conces) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ ok: false, error: 'Error al cargar concesionarios' });
        }
        res.json({ ok: true, usuario: rows[0], concesionarios: conces });
      }
    );
  });
});

router.post('/editar/:id', requireAuth, requireAdmin, (req, res) => {
  const id = req.params.id;
  const { nombre, correo, telefono, rol, id_concesionario } = req.body;

  const errores = [];
  if (!nombre || !correo) errores.push('Nombre y correo son obligatorios');
  if (telefono && isNaN(telefono)) errores.push('El teléfono debe ser numérico');

  if (errores.length > 0) {
    return res.status(400).json({ ok: false, errores });
  }

  const sqlUpdate = `
    UPDATE usuarios
    SET nombre = ?, correo = ?, telefono = ?, rol = ?, id_concesionario = ?
    WHERE id_usuario = ?
  `;

  db.query(
    sqlUpdate,
    [nombre, correo, telefono || null, rol, id_concesionario || null, id],
    (err) => {
      if (err) {
        console.error("Error al actualizar usuario:", err);
        return res.status(500).json({ ok: false, errores: ['No se pudo actualizar el usuario'] });
      }
      res.json({ ok: true });
    }
  );
});

module.exports = router;