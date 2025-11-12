// routes/vehiculos.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const tiposVehiculos = [
  'Coche', 'Moto', 'Camión', 'Autobús',
  'Bicicleta', 'Furgoneta', 'Camioneta', 'Scooter'
];

// --- RUTA: /vehiculos (listado + filtro + JSON opcional) ---
router.get('/', (req, res) => {
  const tipo = req.query.tipo;
  let tiposFiltrados = tiposVehiculos;

  if (tipo) {
    tiposFiltrados = tiposVehiculos.filter(t =>
      t.toLowerCase().includes(tipo.toLowerCase())
    );
  }

  // Si se pide formato JSON directamente
  if (req.query.format === 'json') {
    return res.json({
      total: tiposFiltrados.length,
      filtro: tipo || 'ninguno',
      tipos: tiposFiltrados
    });
  }

  // Render con EJS
  res.render('vehiculos', {
    vehiculos: tiposFiltrados,
    mensaje: tipo
      ? `Mostrando tipos que contienen: <strong>${tipo}</strong> (${tiposFiltrados.length} resultados)`
      : `Mostrando todos los tipos de vehículos (${tiposFiltrados.length} resultados)`,
    filtro: tipo || ''
  });
});

// --- RUTA: /vehiculos/:id (detalle de vehículo) ---
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const tipoVehiculo = tiposVehiculos[id - 1];

  if (!tipoVehiculo) {
    return res.status(404).render('404', { mensaje: `Vehículo con ID ${id} no encontrado.` });
  }

  res.render('detalle_vehiculo', {
    id,
    tipo: tipoVehiculo,
    descripcion: `El vehículo ${tipoVehiculo} es ideal para diferentes usos.`
  });
});



module.exports = router;
