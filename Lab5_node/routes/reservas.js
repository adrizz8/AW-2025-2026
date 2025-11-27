// routes/reservas.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const requireAuth = require('../middlewares/auth');
const requireAdmin = require('../middlewares/requireAdmin');

const router = express.Router();

const reservas = [];

// --- /reservar ---
router.get('/', requireAuth, (req, res) => {
  res.render('reservar', {
    titulo: 'Reservar vehículo',
    // usuario: req.session.usuario || null
  });
});


router.post('/procesar-reserva', (req, res) => {
  const datos = req.body;

  // --- VALIDACIÓN DE FECHAS ---
  const ahora = new Date();
  const inicio = new Date(`${datos.fecha_inicio}T${datos.hora_inicio}`);
  const fin = new Date(`${datos.fecha_fin}T${datos.hora_fin}`);

  if (inicio < ahora) {
    return res.json({
      ok: false,
      error: "La fecha de inicio no puede ser anterior al momento actual."
    });
  }

  if (fin <= inicio) {
    return res.json({
      ok: false,
      error: "La fecha de devolución debe ser posterior a la de inicio."
    });
  }

  // --- GUARDAR RESERVA ---
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

  return res.json({
    ok: true,
    mensaje: "Reserva realizada correctamente",
    reserva: nuevaReserva
  });
});

// --- /lista_reservas ---
router.get('/lista_reservas',requireAuth,requireAdmin, (req, res) => {
  res.render('lista_reservas', {
    titulo: 'Listado de reservas',
    reservas,
    total: reservas.length
  });
});


module.exports = router;
