const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/auth');
const requireAdmin = require('../middlewares/requireAdmin');
const db = require('../public/js/conexion'); // conexión MySQL sin promesas

// --- LISTA DE CONCESIONARIOS ---
router.get('/',requireAdmin, (req, res) => {
const q = (req.query.q || '').toLowerCase();
const tipo = (req.query.tipo || '').toLowerCase();

let query = 'SELECT * FROM concesionarios WHERE 1';
let params = [];

if (q) {
query += ' AND (LOWER(nombre) LIKE ? OR LOWER(ciudad) LIKE ?)';
params.push(`%${q}%`, `%${q}%`);
}

db.query(query, params, (err, results) => {
if (err) {
console.error(err);
return res.status(500).render('500', { mensaje: 'Error al obtener los concesionarios' });
}

res.render('concesionarios', { titulo: 'Lista de Concesionarios', results });


});
});

router.get('/nuevo', requireAdmin, (req, res) => {
res.render('concesionarios_nuevo', { titulo: 'Nuevo Concesionario', datos: {}, errores: [] });
});

// --- NUEVO CONCESIONARIO (POST) ---
router.post('/nuevo', requireAdmin, (req, res) => {
  const { nombre, ciudad, direccion, telefono_contacto } = req.body;

  if (!nombre || !ciudad || !direccion || !telefono_contacto) {
    return res.status(400).send('Todos los campos son obligatorios');
    }

    if (isNaN(telefono_contacto)) {
    return  res.status(400).send('El teléfono de contacto debe ser numérico');
    }

    if (telefono_contacto.length !=9) {
    return res.status(400).send('El teléfono de contacto debe tener 9 dígitos');
    }
  
  
  const sql = 'INSERT INTO concesionarios (nombre,ciudad,direccion,telefono_contacto) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombre, ciudad, direccion, telefono_contacto], (err, result) => {
    if (err) return res.status(500).send('Error al insertar concesionario');
    res.status(200).send('OK'); 
  });
});


module.exports = router;