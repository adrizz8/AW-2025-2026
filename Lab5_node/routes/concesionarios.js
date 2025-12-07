const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/auth');
const requireAdmin = require('../middlewares/requireAdmin');
const db = require('../public/js/conexion'); // conexión MySQL sin promesas

const mensajes = {
  vehiculos_vinculados: 'No se puede dar de baja el concesionario porque tiene vehículos activos vinculados.',
  usuarios_vinculados:  'No se puede dar de baja el concesionario porque tiene empleados activos vinculados.'
};

// --- LISTA DE CONCESIONARIOS ---
router.get('/', requireAdmin, (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const errorKey = req.query.error;
  const mensajeError = errorKey ? mensajes[errorKey] : null;

  let query = 'SELECT * FROM concesionarios WHERE activo = 1';
  let params = [];

  if (q) {
    query += ' AND (LOWER(nombre) LIKE ? OR LOWER(ciudad) LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).render('500', { mensaje: 'Error al obtener los concesionarios', mostrarHeader: true, mostrarFooter: true });
    }

    res.render('concesionarios', {
      titulo: 'Lista de Concesionarios',
      results,
      mostrarHeader: true,
      mostrarFooter: true,
      admin: true,
      mensajeError
    });
  });
});


router.get('/nuevo', requireAdmin, (req, res) => {
  res.render('concesionarios_nuevo', {
    titulo: 'Nuevo Concesionario',
    datos: {},
    errores: [],
    mostrarHeader: true,
    mostrarFooter: true
  });
});


// --- NUEVO CONCESIONARIO (POST) ---
router.post('/nuevo', requireAdmin, (req, res) => {
  const { nombre, ciudad, direccion, telefono_contacto } = req.body;

  if (!nombre || !ciudad || !direccion || !telefono_contacto) {
    return res.status(400).send('Todos los campos son obligatorios');
  }

  if (isNaN(telefono_contacto)) {
    return res.status(400).send('El teléfono de contacto debe ser numérico');
  }

  if (telefono_contacto.length != 9) {
    return res.status(400).send('El teléfono de contacto debe tener 9 dígitos');
  }


  const sql = 'INSERT INTO concesionarios (nombre,ciudad,direccion,telefono_contacto) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombre, ciudad, direccion, telefono_contacto], (err, result) => {
    if (err) return res.status(500).send('Error al insertar concesionario');
    res.status(200).send('OK');
  });
});

// --- ELIMINAR CONCESIONARIO ---
router.post('/:id/eliminar', requireAdmin, (req, res) => {
  const id = req.params.id;

  const sqlCheckVehiculos = `
    SELECT COUNT(*) AS total
    FROM vehiculos
    WHERE id_concesionario = ? AND activo = 1
  `;

  const sqlCheckUsuarios = `
    SELECT COUNT(*) AS total
    FROM usuarios
    WHERE id_concesionario = ? AND activo = 1
  `;

  // 1) Comprobar vehículos activos
  db.query(sqlCheckVehiculos, [id], (err, rowsVeh) => {
    if (err) {
      console.error(err);
      return res.status(500).render('500', {
        mensaje: 'Error al comprobar vehículos vinculados',
        mostrarHeader: true,
        mostrarFooter: true
      });
    }

    const totalVehiculos = rowsVeh[0].total;

    if (totalVehiculos > 0) {
      // Hay vehículos activos → no permitir baja
      return res.redirect('/concesionarios?error=vehiculos_vinculados');
    }

    // 2) Comprobar usuarios activos
    db.query(sqlCheckUsuarios, [id], (err2, rowsUsu) => {
      if (err2) {
        console.error(err2);
        return res.status(500).render('500', {
          mensaje: 'Error al comprobar usuarios vinculados',
          mostrarHeader: true,
          mostrarFooter: true
        });
      }

      const totalUsuarios = rowsUsu[0].total;

      if (totalUsuarios > 0) {
        // Hay empleados activos en ese concesionario
        return res.redirect('/concesionarios?error=usuarios_vinculados');
      }

      // 3) Si no hay ni vehículos ni usuarios → borrado lógico
      const sqlDelete = 'UPDATE concesionarios SET activo = 0 WHERE id_concesionario = ?';
      db.query(sqlDelete, [id], (err3) => {
        if (err3) {
          console.error(err3);
          return res.status(500).render('500', {
            mensaje: 'Error al eliminar concesionario',
            mostrarHeader: true,
            mostrarFooter: true
          });
        }
        return res.redirect('/concesionarios');
      });
    });
  });
});


module.exports = router;

router.get('/:id/editar', requireAdmin, (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM concesionarios WHERE id_concesionario = ? AND activo = 1',
    [id],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).render('500', {
          mensaje: 'Error al cargar concesionario',
          mostrarHeader: true,
          mostrarFooter: true
        });
      }
      if (rows.length === 0) {
        return res.status(404).render('404', {
          mensaje: 'Concesionario no encontrado',
          mostrarHeader: true,
          mostrarFooter: true
        });
      }
      res.render('concesionario_editar', {
        titulo: 'Editar Concesionario',
        concesionario: rows[0],
        errores: [],
        mostrarHeader: true,
        mostrarFooter: true
      });
    });
});


router.post('/:id/editar', requireAdmin, (req, res) => {
  const id = req.params.id;
  const { nombre, ciudad, direccion, telefono_contacto } = req.body;

  const errores = [];
  if (!nombre || !ciudad || !direccion || !telefono_contacto) {
    errores.push('Todos los campos son obligatorios');
  }
  if (isNaN(telefono_contacto)) {
    errores.push('El teléfono de contacto debe ser numérico');
  }
  if (telefono_contacto.length !== 9) {
    errores.push('El teléfono de contacto debe tener 9 dígitos');
  }

  if (errores.length > 0) {
    return res.render('concesionario_editar', {
      titulo: 'Editar Concesionario',
      concesionario: { id_concesionario: id, nombre, ciudad, direccion, telefono_contacto },
      errores,
      mostrarHeader: true,
      mostrarFooter: true
    });
  }

  const sql = `
    UPDATE concesionarios
    SET nombre = ?, ciudad = ?, direccion = ?, telefono_contacto = ?
    WHERE id_concesionario = ? AND activo = 1
  `;
  db.query(sql, [nombre, ciudad, direccion, telefono_contacto, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).render('500', {
        mensaje: 'Error al actualizar concesionario',
        mostrarHeader: true,
        mostrarFooter: true
      });
    }

    res.redirect('/concesionarios');
  });
});

// --- DETALLES CONCESIONARIO ---
router.get('/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  db.query(
    'SELECT * FROM concesionarios WHERE id_concesionario = ? AND activo = 1',
    [id],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).render('500', { mensaje: 'Error al cargar concesionario', mostrarHeader: true, mostrarFooter: true });
      }
      if (rows.length === 0) {
        return res.status(404).render('404', { mensaje: 'Concesionario no encontrado', mostrarHeader: true, mostrarFooter: true });
      }
      res.render('concesionario_detalle', {
        titulo: 'Detalle Concesionario',
        concesionario: rows[0],
        mostrarHeader: true,
        mostrarFooter: true
      });
    }
  );
});
