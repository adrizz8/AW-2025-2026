const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/auth');
const db = require('../public/js/conexion'); // conexión MySQL sin promesas

// --- LISTA VEHÍCULOS ---
router.get('/', (req, res) => {
const q = (req.query.q || '').toLowerCase();
const tipo = (req.query.tipo || '').toLowerCase();

let query = 'SELECT * FROM vehiculos WHERE 1';
let params = [];

if (q) {
query += ' AND (LOWER(marca) LIKE ? OR LOWER(modelo) LIKE ?)';
params.push(`%${q}%`, `%${q}%`);
}

if (tipo) {
query += ' AND LOWER(tipo) = ?';
params.push(tipo);
}

db.query(query, params, (err, results) => {
if (err) {
console.error(err);
return res.status(500).render('500', { mensaje: 'Error al obtener vehículos' });
}

    res.render('vehiculos', {
      titulo: 'Lista de Vehículos',
      results,
      q,
      tipo,
      admin: req.session?.usuario?.esAdmin === true,
      mostrarHeader: true,
      mostrarFooter: true
    });

});
});

// --- NUEVO VEHÍCULO (GET) ---
router.get('/nuevo', requireAuth, (req, res) => {
  db.query('SELECT id_concesionario, nombre FROM concesionarios', (err, concesionarios) => {
    if (err) {
      console.error(err);
      return res.status(500).render('500', { mensaje: 'Error al obtener concesionarios' });
    }

    res.render('vehiculo_nuevo', {
      titulo: 'Nuevo Vehículo',
      datos: {},
      errores: [],
      concesionarios,
      mostrarHeader: true,
      mostrarFooter: true
    });
  });
});	
// --- NUEVO VEHÍCULO (POST) ---
router.post('/nuevo', requireAuth, (req, res) => {
  const {
    matricula, marca, modelo,
    anio_matriculacion, numero_plazas,
    autonomia_km, color, imagen, estado,
    id_concesionario
  } = req.body;

  const errores = [];

  if (!imagen || (!imagen.startsWith('http://') && !imagen.startsWith('https://'))) {
    errores.push("La URL de la imagen debe ser válida.");
  }
  if (!matricula || !marca || !modelo || !anio_matriculacion ||
      !numero_plazas || !autonomia_km || !color || !estado || !id_concesionario) {
    errores.push("Todos los campos son obligatorios.");
  }
  if (isNaN(autonomia_km)) errores.push("La autonomía del vehículo debe ser numérica.");
  if (isNaN(numero_plazas)) errores.push("El número de plazas debe ser numérico.");
  if (isNaN(anio_matriculacion)) errores.push("El año de matriculación debe ser numérico.");
  if (isNaN(id_concesionario)) errores.push("El ID del concesionario debe ser numérico.");

  if (errores.length > 0) {
    return db.query('SELECT id_concesionario, nombre FROM concesionarios', (err2, concesionarios) => {
      if (err2) {
        console.error(err2);
        return res
          .status(500)
          .render('500', { mensaje: 'Error al obtener concesionarios', mostrarHeader: true, mostrarFooter: true });
      }

      return res.render('vehiculo_nuevo', {
        titulo: 'Nuevo Vehículo',
        datos: req.body,
        errores,
        concesionarios,
        mostrarHeader: true,
        mostrarFooter: true
      });
    });
  }

  const sql = `
    INSERT INTO vehiculos
    (matricula, marca, modelo, anio_matriculacion, numero_plazas,
     autonomia_km, color, imagen, estado, id_concesionario)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    matricula, marca, modelo, anio_matriculacion,
    numero_plazas, autonomia_km, color, imagen, estado, id_concesionario
  ];

  db.query(sql, params, (err) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .render('500', { mensaje: 'Error al insertar vehículo', mostrarHeader: true, mostrarFooter: true });
    }
    res.redirect('/vehiculos');
  });
});

// --- DETALLE VEHÍCULO ---
router.get('/:id', (req, res) => {
const id = parseInt(req.params.id);
db.query('SELECT * FROM vehiculos WHERE id_vehiculo = ?', [id], (err, results) => {
if (err) return res.status(500).render('500', { mensaje: 'Error al obtener vehículo' });
if (results.length === 0) return res.status(404).render('404', { mensaje: 'Vehículo no encontrado' });


    res.render('vehiculo_detalle', {
      titulo: 'Detalle Vehículo',
      vehiculo: results[0],
      mostrarHeader: true,
      mostrarFooter: true
    });

});
});

// --- EDITAR VEHÍCULO (GET) ---
router.get('/:id/editar', requireAuth, (req, res) => {
const id = parseInt(req.params.id);
db.query('SELECT * FROM vehiculos WHERE id_vehiculo = ?', [id], (err, results) => {
if (err) return res.status(500).render('500', { mensaje: 'Error al obtener vehículo' });
if (results.length === 0) return res.status(404).render('404', { mensaje: 'Vehículo no encontrado' });


    res.render('vehiculo_editar', {
      titulo: 'Editar Vehículo',
      vehiculo: results[0],
      errores: [],
      mostrarHeader: true,
      mostrarFooter: true
    });

});
});

// --- EDITAR VEHÍCULO (POST) ---
router.post('/:id/editar', requireAuth, (req, res) => {
const id = parseInt(req.params.id);
const { matricula,marca, modelo,anio_matriculacion,numero_plazas,autonomia_km,color,imagen,estado,id_concesionario } = req.body;
let errores = [];

if (!imagen || (!imagen.startsWith('http://') && !imagen.startsWith('https://'))) errores.push("La URL de la imagen no es válida.");
if (!matricula || !marca || !modelo || !anio_matriculacion || !numero_plazas || !autonomia_km || !color || !estado || !id_concesionario) errores.push("Todos los campos son obligatorios.");
if (isNaN(autonomia_km)) errores.push("La autonomía del vehículo debe ser numérica.");
if (isNaN(numero_plazas)) errores.push("El número de plazas debe ser numérico.");
if (isNaN(anio_matriculacion)) errores.push("El año de matriculación debe ser numérico.");
if (isNaN(id_concesionario)) errores.push("El ID del concesionario debe ser numérico.");

if (errores.length > 0) {
  db.query('SELECT * FROM vehiculos WHERE id_vehiculo = ?', [id], (err, results) => {
    if (err) {
      return res
        .status(500)
        .render('500', { mensaje: 'Error al obtener vehículo', mostrarHeader: true, mostrarFooter: true });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .render('404', { mensaje: 'Vehículo no encontrado', mostrarHeader: true, mostrarFooter: true });
    }

    res.render('vehiculo_editar', {
      titulo: 'Editar Vehículo',
      vehiculo: results[0],
      errores,                
      mostrarHeader: true,
      mostrarFooter: true
    });
  });
  return;
}

db.query('UPDATE vehiculos SET matricula = ?, marca = ?, modelo = ?,anio_matriculacion = ?,numero_plazas = ?,autonomia_km = ?, color = ?,imagen = ?,estado = ?,id_concesionario = ? WHERE id_vehiculo = ?', [matricula,marca, modelo,anio_matriculacion,numero_plazas,autonomia_km,color,imagen,estado,id_concesionario,id], (err, result) => {
if (err) return res.status(500).render('500', { mensaje: 'Error al actualizar vehículo' });
res.redirect('/vehiculos');
});
});

// --- ELIMINAR VEHÍCULO ---
router.post('/:id/eliminar', requireAuth, (req, res) => {
const id = parseInt(req.params.id);
db.query('DELETE FROM vehiculos WHERE id_vehiculo = ?', [id], (err, result) => {
if (err) return res.status(500).render('500', { mensaje: 'Error al eliminar vehículo' });
if (result.affectedRows === 0) return res.status(404).render('404', { mensaje: 'Vehículo no encontrado' });


res.redirect('/vehiculos');


});
});

module.exports = router;
