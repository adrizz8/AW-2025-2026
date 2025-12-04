// routes/reservas.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const requireAuth = require('../middlewares/auth');
const requireAdmin = require('../middlewares/requireAdmin');
const db = require('../public/js/conexion'); 

const router = express.Router();

const reservas = [];

// --- GET /reservas - Renderiza la vista con reservas y vehículos disponibles ---
router.get('/', requireAuth, (req, res) => {
  let queryReservas = 'SELECT * FROM reservas ORDER BY fecha_inicio DESC';
  let queryVehiculos = 'SELECT * FROM vehiculos WHERE disponible = true OR disponible = 1';
  
  db.query(queryReservas, (err, reservas) => {
    if (err) {
      console.error('Error al obtener reservas:', err);
      return res.status(500).render('500', { mensaje: 'Error al obtener reservas' });
    }

    db.query(queryVehiculos, (err2, vehiculos) => {
      if (err2) {
        console.error('Error al obtener vehículos:', err2);
        return res.status(500).render('500', { mensaje: 'Error al obtener vehículos para reservar' });
      }

      res.render('reservas', { 
        titulo: 'Lista de Reservas', 
        results: reservas,
        vehiculos: vehiculos  // Importante: se llama "vehiculos" para que coincida con el modal
      });
    });
  });
});

// --- POST /reservas/nueva - Crear nueva reserva ---
router.post('/nueva', requireAuth, (req, res) => {
  const { id_vehiculo, fecha_inicio, fecha_fin } = req.body;

  // Validación de campos obligatorios
  if (!id_vehiculo|| !fecha_inicio || !fecha_fin) {
    return res.status(400).json({
      ok: false,
      error: 'Todos los campos son obligatorios'
    });
  }

  // Convertir las fechas del formato dd/MM/yyyy HH:mm a formato MySQL
  const parseFecha = (fechaStr) => {
    // Ejemplo entrada: "25/12/2024 14:30"
    const [fecha, hora] = fechaStr.split(' ');
    const [dia, mes, año] = fecha.split('/');
    return `${año}-${mes}-${dia} ${hora}:00`;
  };

  const fechaInicioMySQL = parseFecha(fecha_inicio);
  const fechaFinMySQL = parseFecha(fecha_fin);

  // Validar que las fechas sean lógicas
  const inicio = new Date(fechaInicioMySQL);
  const fin = new Date(fechaFinMySQL);
  const ahora = new Date();

  if (inicio < ahora) {
    return res.status(400).json({
      ok: false,
      error: 'La fecha de inicio no puede ser anterior al momento actual'
    });
  }

  if (fin <= inicio) {
    return res.status(400).json({
      ok: false,
      error: 'La fecha de devolución debe ser posterior a la fecha de inicio'
    });
  }

  // Verificar que el vehículo existe y está disponible
  const queryVerificar = 'SELECT * FROM vehiculos WHERE id_vehiculo = ? AND (estado = "disponible")';
  
  db.query(queryVerificar, [id_vehiculo], (err, vehiculos) => {
    if (err) {
      console.error('Error al verificar vehículo:', err);
      return res.status(500).json({
        ok: false,
        error: 'Error al verificar disponibilidad del vehículo'
      });
    }

    if (vehiculos.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'El vehículo seleccionado no está disponible'
      });
    }

    // Insertar la reserva
    const queryInsertar = `
      INSERT INTO reservas 
      (id_vehiculo, nombre_cliente, ciudad, direccion, telefono_contacto, fecha_inicio, fecha_fin) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')
    `;

    const params = [vehiculo_id, nombre, ciudad, direccion, telefono_contacto, fechaInicioMySQL, fechaFinMySQL];

    db.query(queryInsertar, params, (err, result) => {
      if (err) {
        console.error('Error al crear reserva:', err);
        return res.status(500).json({
          ok: false,
          error: 'Error al crear la reserva en la base de datos'
        });
      }

      console.log('✅ Reserva creada exitosamente:', result.insertId);

      // Opcionalmente, actualizar disponibilidad del vehículo
      db.query('UPDATE vehiculos SET estado = "reservado" WHERE id_vehiculo = ?', [vehiculo_id]);

      return res.json({
        ok: true,
        mensaje: 'Reserva creada correctamente',
        reserva_id: result.insertId
      });
    });
  });
});


module.exports = router;