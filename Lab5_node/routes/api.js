const express = require('express');
const router = express.Router();
const vehiculos = require('../datos/vehiculosmem');

// Ruta API: /api/vehiculos
router.get('/vehiculos', (req, res) => {
  const q = (req.query.q || "").toLowerCase();

  let filtrados = vehiculos;
  if (q) {
    filtrados = vehiculos.filter(v =>
      v.marca.toLowerCase().includes(q) ||
      v.modelo.toLowerCase().includes(q)
    );
  }

  res.json(filtrados);
});

module.exports = router;
