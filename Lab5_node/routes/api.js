const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

//Hay que mirar como lo podemos importar desde vehiculos.js
const tiposVehiculos = [
  'Coche', 'Moto', 'Camión', 'Autobús',
  'Bicicleta', 'Furgoneta', 'Camioneta', 'Scooter'
];



// --- RUTA API: /api/vehiculos ---
router.get('/vehiculos', (req, res) => {
  res.json({
    total: tiposVehiculos.length,
    vehiculos: tiposVehiculos.map((v, i) => ({
      id: i + 1,
      tipo: v
    }))
  });
});

module.exports = router;