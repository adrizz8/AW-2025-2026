const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const requireAdmin = require('../middlewares/requireAdmin');
const requireAuth = require('../middlewares/auth');
const usuarios = require('../datos/usuarios');


router.get('/', requireAuth, requireAdmin, (req, res) => {
  res.render('usuarios', {
    titulo: "Listado de usuarios",
    usuarios,
    usuario: req.session.usuario
  });
});

module.exports = router;
