const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/auth');
const db = require('../public/js/conexion'); // conexión MySQL sin promesas

router.get('/', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const tipo = (req.query.tipo || '').toLowerCase();

  const usuario = req.session.usuario || null;
  const esAdmin = usuario && usuario.rol === 'admin';
  const idConcUsuario = usuario ? usuario.id_concesionario : null;

  let query = `
    SELECT 
      v.*,
      c.nombre AS nombre_concesionario
    FROM vehiculos v
    LEFT JOIN concesionarios c
      ON v.id_concesionario = c.id_concesionario
    WHERE v.activo = 1
  `;
  const params = [];

  // Si NO es admin y tiene concesionario asignado → filtrar por ese concesionario
  if (!esAdmin && idConcUsuario) {
    query += ' AND v.id_concesionario = ?';
    params.push(idConcUsuario);
  }

  if (q) {
    query += ' AND (LOWER(v.marca) LIKE ? OR LOWER(v.modelo) LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  if (tipo) {
    query += ' AND LOWER(v.tipo) = ?';
    params.push(tipo);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).render('500', {
        mensaje: 'Error al obtener vehículos',
        mostrarHeader: true,
        mostrarFooter: true
      });
    }

    res.render('vehiculos', {
      titulo: 'Lista de Vehículos',
      results,
      q,
      tipo,
      mostrarHeader: true,
      mostrarFooter: true,
      admin: esAdmin
    });
  });
});

// --- NUEVO VEHÍCULO (GET) ---
router.get('/nuevo', requireAuth, (req, res) => {
  db.query('SELECT id_concesionario, nombre FROM concesionarios WHERE activo = 1', (err, concesionarios) => {
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

  // Validaciones básicas
  if (!imagen || (!imagen.startsWith('http://') && !imagen.startsWith('https://'))) {
    errores.push("La URL de la imagen debe ser válida.");
  }
  if (!matricula || !marca || !modelo || !anio_matriculacion ||
    !numero_plazas || !autonomia_km || !color || !estado || !id_concesionario) {
    errores.push("Todos los campos marcados con * son obligatorios.");
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

  // 1) Buscar si ya existe un vehículo con esa matrícula
  const sqlBusca = 'SELECT * FROM vehiculos WHERE matricula = ?';
  db.query(sqlBusca, [matricula], (errBusca, rows) => {
    if (errBusca) {
      console.error(errBusca);
      return res
        .status(500)
        .render('500', { mensaje: 'Error al comprobar matrícula', mostrarHeader: true, mostrarFooter: true });
    }

    // Si existe y está activo = 1 → error
    if (rows.length > 0 && rows[0].activo === 1) {
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
          errores: ['Ya existe un vehículo activo con esa matrícula.'],
          concesionarios,
          mostrarHeader: true,
          mostrarFooter: true
        });
      });
    }

    // Si existe pero activo = 0 → comprobar que los campos fijos NO cambian
    if (rows.length > 0 && rows[0].activo === 0) {
      const vDb = rows[0];

      const cambianFijos =
        vDb.marca !== marca ||
        vDb.modelo !== modelo ||
        String(vDb.anio_matriculacion) !== String(anio_matriculacion) ||
        Number(vDb.numero_plazas) !== Number(numero_plazas) ||
        vDb.color !== color;

      if (cambianFijos) {
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
            errores: [
              'No se puede reactivar un vehículo con nueva matrícula ya existente cambiando marca, modelo, año, plazas o color. Edita el vehículo existente si necesitas corregir esos datos.'
            ],
            concesionarios,
            mostrarHeader: true,
            mostrarFooter: true
          });
        });
      }

      // Si los campos fijos coinciden → reactivar y permitir actualizar campos no críticos
      const sqlReactiva = `
        UPDATE vehiculos
        SET activo = 1,
            imagen = ?,
            estado = ?,
            id_concesionario = ?
        WHERE matricula = ?
      `;
      const paramsReactiva = [
        imagen || vDb.imagen,
        estado || vDb.estado,
        id_concesionario || vDb.id_concesionario,
        matricula
      ];

      return db.query(sqlReactiva, paramsReactiva, (errUpd) => {
        if (errUpd) {
          console.error(errUpd);
          return res
            .status(500)
            .render('500', { mensaje: 'Error al reactivar vehículo', mostrarHeader: true, mostrarFooter: true });
        }
        return res.redirect('/vehiculos');
      });
    }

    // Si no existe → INSERT normal
    const sqlInsert = `
      INSERT INTO vehiculos
      (matricula, marca, modelo, anio_matriculacion, numero_plazas,
       autonomia_km, color, imagen, estado, id_concesionario)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const paramsInsert = [
      matricula, marca, modelo, anio_matriculacion,
      numero_plazas, autonomia_km, color, imagen, estado, id_concesionario
    ];

    db.query(sqlInsert, paramsInsert, (errIns) => {
      if (errIns) {
        console.error(errIns);
        return res
          .status(500)
          .render('500', { mensaje: 'Error al insertar vehículo', mostrarHeader: true, mostrarFooter: true });
      }
      return res.redirect('/vehiculos');
    });
  });
});


// --- DETALLE VEHÍCULO ---
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.query('SELECT * FROM vehiculos WHERE id_vehiculo = ? AND activo = 1', [id], (err, results) => {
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

  // 1) Obtener vehículo
  db.query('SELECT * FROM vehiculos WHERE id_vehiculo = ? AND activo = 1', [id], (err, results) => {
    if (err) {
      return res.status(500).render('500', { mensaje: 'Error al obtener vehículo', mostrarHeader: true, mostrarFooter: true });
    }
    if (results.length === 0) {
      return res.status(404).render('404', { mensaje: 'Vehículo no encontrado', mostrarHeader: true, mostrarFooter: true });
    }

    const vehiculo = results[0];

    // 2) Obtener lista de concesionarios activos
    db.query('SELECT id_concesionario, nombre FROM concesionarios WHERE activo = 1', (err2, concesionarios) => {
      if (err2) {
        console.error(err2);
        return res.status(500).render('500', { mensaje: 'Error al obtener concesionarios', mostrarHeader: true, mostrarFooter: true });
      }

      res.render('vehiculo_editar', {
        titulo: 'Editar Vehículo',
        vehiculo,
        concesionarios,
        errores: [],
        mostrarHeader: true,
        mostrarFooter: true
      });
    });
  });
});


// --- EDITAR VEHÍCULO (POST) ---
router.post('/:id/editar', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { matricula, marca, modelo, anio_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario } = req.body;
  let errores = [];

  if (!imagen || (!imagen.startsWith('http://') && !imagen.startsWith('https://'))) errores.push("La URL de la imagen no es válida.");
  if (!matricula || !marca || !modelo || !anio_matriculacion || !numero_plazas || !color || !estado || !id_concesionario) errores.push("Todos los campos son obligatorios.");
  if (isNaN(numero_plazas)) errores.push("El número de plazas debe ser numérico.");
  if (isNaN(anio_matriculacion)) errores.push("El año de matriculación debe ser numérico.");
  if (isNaN(id_concesionario)) errores.push("El ID del concesionario debe ser numérico.");

  if (errores.length > 0) {
    // Volvemos a cargar concesionarios para el select
    db.query('SELECT id_concesionario, nombre FROM concesionarios WHERE activo = 1', (err2, concesionarios) => {
      if (err2) {
        console.error(err2);
        return res
          .status(500)
          .render('500', { mensaje: 'Error al obtener concesionarios', mostrarHeader: true, mostrarFooter: true });
      }

      // Usamos los datos que el usuario acaba de enviar para no perder el formulario
      const vehiculoConDatos = {
        id_vehiculo: id,
        matricula,
        marca,
        modelo,
        anio_matriculacion,
        numero_plazas,
        autonomia_km,
        color,
        imagen,
        estado,
        id_concesionario
      };

      return res.render('vehiculo_editar', {
        titulo: 'Editar Vehículo',
        vehiculo: vehiculoConDatos,
        concesionarios,
        errores,
        mostrarHeader: true,
        mostrarFooter: true
      });
    });

    return;
  }

  db.query('UPDATE vehiculos SET matricula = ?, marca = ?, modelo = ?,anio_matriculacion = ?,numero_plazas = ?,autonomia_km = ?, color = ?,imagen = ?,estado = ?,id_concesionario = ? WHERE id_vehiculo = ?', [matricula, marca, modelo, anio_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario, id], (err, result) => {
    if (err) return res.status(500).render('500', { mensaje: 'Error al actualizar vehículo' });
    res.redirect('/vehiculos');
  });
});

// --- ELIMINAR VEHÍCULO ---
router.post('/:id/eliminar', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);

  const sql = 'UPDATE vehiculos SET activo = 0 WHERE id_vehiculo = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).render('500', { mensaje: 'Error al eliminar vehículo', mostrarHeader: true, mostrarFooter: true });
    }

    if (result.affectedRows === 0) {
      return res.status(404).render('404', { mensaje: 'Vehículo no encontrado', mostrarHeader: true, mostrarFooter: true });
    }

    res.redirect('/vehiculos');
  });
});
module.exports = router;
