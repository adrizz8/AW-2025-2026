const express = require('express');
const router = express.Router();
const vehiculos = require('../datos/vehiculosmem');

let reservas = [];

// Ruta API: /api/vehiculos con filtro por tipo
router.get('/vehiculos', (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  const tipo = (req.query.tipo || "").toLowerCase();

  let filtrados = vehiculos;

  // Filtrar por búsqueda de texto
  if (q) {
    filtrados = filtrados.filter(v =>
      v.marca.toLowerCase().includes(q) ||
      v.modelo.toLowerCase().includes(q)
    );
  }

  // Filtrar por tipo
  if (tipo) {
    filtrados = filtrados.filter(v => 
      v.tipo.toLowerCase() === tipo
    );
  }

  res.status(200).json(filtrados);
});

// POST del formulario de reservas /api/reservas
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

  // --- VALIDACIÓN DE FECHAS ---
  const ahora = new Date();
  const inicio = new Date(`${datos.fecha_inicio}T${datos.hora_inicio}`);
  const fin = new Date(`${datos.fecha_fin}T${datos.hora_fin}`);

  if (inicio < ahora) {
    return res.status(400).json({
      ok: false,
      error: "La fecha de inicio no puede ser anterior al momento actual."
    });
  }

  if (fin <= inicio) {
    return res.status(400).json({
      ok: false,
      error: "La fecha de devolución debe ser posterior a la de inicio."
    });
  }

  // --- CREAR RESERVA ---
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

  return res.status(201).json({
    ok: true,
    mensaje: "Reserva creada correctamente",
    reserva: nuevaReserva
  });
});

// GET /api/reservas -> devolver todas las reservas
router.get('/reservas', (req, res) => {
  res.status(200).json(reservas);
});

// DELETE /api/reservas/:id -> eliminar una reserva
router.delete('/reservas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = reservas.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({
      ok: false,
      error: "Reserva no encontrada"
    });
  }

  reservas.splice(index, 1);

  return res.status(200).json({
    ok: true,
    mensaje: "Reserva eliminada correctamente"
  });
});

module.exports = router;