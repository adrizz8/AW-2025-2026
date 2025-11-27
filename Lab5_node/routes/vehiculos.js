const express = require('express');
const router = express.Router();
const vehiculos = require('../datos/vehiculosmem');
const requireAuth = require('../middlewares/auth');
const db = require('../public/js/conexion'); // conexión normal de mysql2 sin promesas

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
return res.status(500).json({ error: 'Error al obtener vehículos desde la base de datos' });
}

res.render('vehiculos', { titulo: 'Lista de Vehículos', vehiculos: results });

});
});


// --- NUEVO VEHÍCULO (GET) ---
router.get('/nuevo',requireAuth, (req, res) => {
  res.render('vehiculo_nuevo', { titulo: 'Nuevo Vehículo' ,datos: {}, errores: []});
});

// --- NUEVO VEHÍCULO (POST) ---
router.post('/nuevo', requireAuth, (req, res) => {
  const { marca, modelo, tipo, precioHora, imagen } = req.body;

    let errores = [];

if (!imagen) {
  errores.push("La URL de la imagen es obligatoria.");
} else if (!imagen.startsWith("http://") && !imagen.startsWith("https://")) {
  errores.push("La imagen debe ser una URL válida.");
}



  if (!marca || !modelo || !tipo || !precioHora) {
    errores.push("Todos los campos son obligatorios.");
  }

  if (isNaN(precioHora)) {
    errores.push("El precio por hora debe ser un número.");
  }

  if (errores.length > 0) {
    return res.render('vehiculo_nuevo', {
      errores,
      datos: req.body
    });
  }

  const id = vehiculos.length ? vehiculos[vehiculos.length - 1].id + 1 : 1;

  vehiculos.push({
    id,
    marca,
    modelo,
    tipo,
    precioHora: parseFloat(precioHora),
    imagen
  });

  res.redirect('/vehiculos');
});

// --- DETALLE VEHÍCULO ---
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const vehiculo = vehiculos.find(v => v.id === id);
  if (!vehiculo) return res.status(404).render('404', { mensaje: 'Vehículo no encontrado' });

  res.render('vehiculo_detalle', { titulo: 'Detalle Vehículo', vehiculo });
});


// --- EDITAR VEHÍCULO (GET) ---
router.get('/:id/editar',requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const vehiculo = vehiculos.find(v => v.id === id);
  if (!vehiculo) return res.status(404).render('404', { mensaje: 'Vehículo no encontrado' });

  res.render('vehiculo_editar', { titulo: 'Editar Vehículo', vehiculo, errores: [] });
});

// --- EDITAR VEHÍCULO (POST) ---
router.post('/:id/editar', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const vehiculo = vehiculos.find(v => v.id === id);

  if (!vehiculo)
    return res.status(404).render('404', { mensaje: 'Vehículo no encontrado' });

  const { marca, modelo, tipo, precioHora, imagen } = req.body;

    let errores = [];

if (!imagen) {
  errores.push("La imagen es obligatoria.");
} else if (!imagen.startsWith("http://") && !imagen.startsWith("https://")) {
  errores.push("La URL de la imagen no es válida.");
}




  if (!marca || !modelo || !tipo || !precioHora) {
    errores.push("Todos los campos son obligatorios.");
  }

  if (isNaN(precioHora)) {
    errores.push("El precio por hora debe ser numérico.");
  }

  if (errores.length > 0) {
    return res.render('vehiculo_editar', {
      errores,
      vehiculo,
    });
  }

  vehiculo.marca = marca;
  vehiculo.modelo = modelo;
  vehiculo.tipo = tipo;
  vehiculo.precioHora = parseFloat(precioHora);
  vehiculo.imagen = imagen;

  res.redirect('/vehiculos');
});


// --- ELIMINAR VEHÍCULO ---
router.post('/:id/eliminar',requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const index = vehiculos.findIndex(v => v.id === id);
  if (index === -1) return res.status(404).render('404', { mensaje: 'Vehículo no encontrado' });

  vehiculos.splice(index, 1);
  res.redirect('/vehiculos');
});

module.exports = router;
