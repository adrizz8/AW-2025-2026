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
      preferencias_accesibilidad
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

module.exports = router;
