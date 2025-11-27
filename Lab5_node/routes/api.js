const express = require('express');
const router = express.Router();
const db = require('../public/js/conexion');
const vehiculos = require('../datos/vehiculos.json'); // conexión normal de mysql2 sin promesas

// ===================== VEHÍCULOS =====================

// GET /api/vehiculos -> listar vehículos del json
router.get('/vehiculos', (req, res) => {
 const q = (req.query.q || "").toLowerCase();

  let filtrados = vehiculos;

  // Filtrar por búsqueda en marca o matrícula
  if (q) {
    filtrados = filtrados.filter(v =>
      v.marca.toLowerCase().includes(q) ||
      v.matricula.toLowerCase().includes(q)
    );
  }

  res.status(200).json(filtrados);
});
// ===================== RESERVAS =====================

// POST /api/reservas -> crear reserva
router.post('/reservas', (req, res) => {
const datos = req.body;

// Validaciones básicas
if (!datos.id_usuario || !datos.id_vehiculo || !datos.fecha_inicio || !datos.hora_inicio || !datos.fecha_fin || !datos.hora_fin) {
return res.status(400).json({ ok: false, error: 'Todos los campos obligatorios deben estar completos' });
}

const inicio = new Date(`${datos.fecha_inicio}T${datos.hora_inicio}`);
const fin = new Date(`${datos.fecha_fin}T${datos.hora_fin}`);
const ahora = new Date();

if (inicio < ahora) return res.status(400).json({ ok: false, error: 'La fecha de inicio no puede ser anterior al momento actual.' });
if (fin <= inicio) return res.status(400).json({ ok: false, error: 'La fecha de fin debe ser posterior a la de inicio.' });

const sqlInsert = 'INSERT INTO reservas (id_usuario, id_vehiculo, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?, ?)';
const paramsInsert = [datos.id_usuario, datos.id_vehiculo, datos.fecha_inicio, datos.fecha_fin, 'activa'];

db.query(sqlInsert, paramsInsert, (err, resultado) => {
if (err) {
console.error(err);
return res.status(500).json({ ok: false, error: 'Error al insertar la reserva en la base de datos' });
}


// Obtener la reserva creada
db.query('SELECT * FROM reservas WHERE id_reserva = ?', [resultado.insertId], (err2, reservaCreada) => {
  if (err2) {
    console.error(err2);
    return res.status(500).json({ ok: false, error: 'Error al obtener la reserva creada' });
  }

  res.status(201).json({ ok: true, mensaje: 'Reserva creada correctamente', reserva: reservaCreada[0] });
});

});
});

// GET /api/reservas -> listar todas las reservas
router.get('/reservas', (req, res) => {
db.query('SELECT * FROM reservas', (err, results) => {
if (err) {
console.error(err);
return res.status(500).json({ error: 'Error al obtener reservas desde la base de datos' });
}
res.json(results);
});
});

// DELETE /api/reservas/:id -> eliminar reserva
router.delete('/reservas/:id', (req, res) => {
const id = parseInt(req.params.id);

db.query('DELETE FROM reservas WHERE id_reserva = ?', [id], (err, resultado) => {
if (err) {
console.error(err);
return res.status(500).json({ ok: false, error: 'Error al eliminar la reserva' });
}

if (resultado.affectedRows === 0) {
  return res.status(404).json({ ok: false, error: 'Reserva no encontrada' });
}

res.json({ ok: true, mensaje: 'Reserva eliminada correctamente' });


});
});

module.exports = router;
