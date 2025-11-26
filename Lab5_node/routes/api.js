const express = require('express');
const router = express.Router();
const vehiculos = require('../datos/vehiculosmem');

let reservas = [];


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


//Post del formulario de reservas /api/reservas
router.post('/reservas', function (req, res) {
  const datos = req.body;

  // Validaciones básicas
  if (
    !datos.nombre ||
    !datos.email ||
    !datos.telefono ||
    !datos.tipo_vehiculo ||
    !datos.fecha_inicio ||
    !datos.hora_inicio ||
    !datos.fecha_fin ||
    !datos.hora_fin
  ) {
    return res.status(400).json({
      ok: false,
      error: "Todos los campos son obligatorios"
    });
  }

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

  return res.json({
    ok: true,
    mensaje: "Reserva creada correctamente",
    reserva: nuevaReserva
  });
});

// GET /api/reservas -> devolver todas las reservas
router.get('/reservas', (req, res) => {
  res.json(reservas);
});



module.exports = router;
