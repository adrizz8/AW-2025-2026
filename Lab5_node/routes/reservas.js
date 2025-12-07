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
  const id_usuario = req.session.usuario.id_usuario;
  const id_concesionario = req.session.usuario.id_concesionario;

  let queryReservas = 'SELECT * FROM reservas WHERE id_usuario = ? ORDER BY fecha_inicio DESC';
  let queryVehiculos = "SELECT * FROM vehiculos WHERE estado = 'disponible' AND id_concesionario = ?";

  db.query(queryReservas, [id_usuario], (err, reservas) => {
    if (err) {
      console.error('Error al obtener reservas:', err);
      return res.status(500).render('500', { mensaje: 'Error al obtener reservas' });
    }

    db.query(queryVehiculos,[id_concesionario], (err2, vehiculos) => {
      if (err2) {
        console.error('Error al obtener vehículos:', err2);
        return res.status(500).render('500', { mensaje: 'Error al obtener vehículos para reservar' });
      }

      res.render('reservas', {
        titulo: 'Mis reservas',
        results: reservas,
        vehiculos: vehiculos,
        mostrarHeader: true,
        mostrarFooter: true,
      });
    });
  });
});


// --- POST /reservas/nueva - Crear nueva reserva ---
router.post('/nueva', requireAuth, (req, res) => {
  const { id_vehiculo, dni_cliente, nombre, fecha_inicio, fecha_fin } = req.body;

  // Validación de campos obligatorios
  if (!id_vehiculo || !fecha_inicio || !fecha_fin || !dni_cliente || !nombre) {
    return res.status(400).json({
      ok: false,
      error: 'Todos los campos son obligatorios'
    });
  }

  const id_usuario = req.session.usuario.id_usuario;

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

  const dniRegex = /^[0-9]{8}[A-Za-z]$/;
  if (!dniRegex.test(dni_cliente)) {
    return res.status(400).json({
      ok: false,
      error: 'El DNI debe tener 8 números y una letra (ej: 12345678A)'
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
  (id_usuario, id_vehiculo, dni_cliente, nombre, fecha_inicio, fecha_fin, estado, kilometros_recorridos, incidencias_reportadas) 
  VALUES (?, ?, ?, ?, ?, ?, 'activa', 0, '')
`;

    const params = [
      id_usuario,
      id_vehiculo,
      dni_cliente,
      nombre,
      fechaInicioMySQL,
      fechaFinMySQL
    ];

    db.query(queryInsertar, params, (err, result) => {
      if (err) {
        console.error('Error al crear reserva:', err);
        return res.status(500).json({
          ok: false,
          error: 'Error al crear la reserva en la base de datos'
        });
      }

      console.log('✅ Reserva creada exitosamente:', result.insertId);


      db.query('UPDATE vehiculos SET estado = "reservado" WHERE id_vehiculo = ?', [id_vehiculo]);

      return res.json({
        ok: true,
        mensaje: 'Reserva creada correctamente',
        reserva_id: result.insertId
      });
    });
  });
});

router.get('/lista', requireAuth, (req, res) => {
 const query = 'SELECT * FROM reservas WHERE id_usuario = ? ORDER BY fecha_inicio DESC';


  db.query(query, [req.session.usuario.id_usuario], (err, resultado) => {
    if (err) {
      console.error("Error al cargar reservas:", err);
      return res.status(500).json({ ok: false, error: "Error al obtener reservas" });
    }

    res.json({
      ok: true,
      reservas: resultado
    });
  });
});


module.exports = router;