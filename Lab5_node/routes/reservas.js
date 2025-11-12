// routes/reservas.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const reservas = [];

// --- /reservar ---
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'reservar.html'));
});

// --- /procesar-reserva ---
router.post('/procesar-reserva', (req, res) => {
  const datos = req.body;

  const nuevaReserva = {
    id: reservas.length + 1,
    nombre: datos.nombre,
    email: datos.email,
    telefono: datos.telefono,
    tipo_vehiculo: datos.tipo_vehiculo,
    fecha_inicio: datos.fecha_inicio,
    hora_inicio: datos.hora_inicio,
    fecha_fin: datos.fecha_fin,
    hora_fin: datos.hora_fin,
    fecha_reserva: new Date().toISOString()
  };

  reservas.push(nuevaReserva);
  console.log('✅ Nueva reserva registrada:', nuevaReserva);

  // Muestra todas las reservas usando EJS
  res.render('lista_reservas', {
    reservas,
    total: reservas.length
  });
});

// --- /lista_reservas ---
router.get('/lista_reservas', (req, res) => {
  res.render('lista_reservas', {
    reservas,
    total: reservas.length
  });
});

module.exports = router;
