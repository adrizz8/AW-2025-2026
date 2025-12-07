const express = require('express');
const router = express.Router();
const db = require('../public/js/conexion');
const multer = require('multer');
const path = require('path');

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde se guardarán temporalmente
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.json') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos JSON'));
    }
  }
});

// Ruta para mostrar la página de setup
router.get('/', (req, res) => {
  // Verificar si la BD está vacía
  db.query('SELECT COUNT(*) as count FROM concesionarios', (err, resultConcesionarios) => {
    if (err) {
      console.error("Error al verificar base de datos:", err);
      return res.render('setup', {
        titulo: 'Configuración inicial',
        mensaje: null,
        error: 'Error al verificar la base de datos',
        logs: [],
        bdVacia: true,
        mostrarHeader: false,
        mostrarFooter: false
      });
    }

    db.query('SELECT COUNT(*) as count FROM vehiculos', (err2, resultVehiculos) => {
      if (err2) {
        console.error("Error al verificar base de datos:", err2);
        return res.render('setup', {
          titulo: 'Configuración inicial',
          mensaje: null,
          error: 'Error al verificar la base de datos',
          logs: [],
          bdVacia: true,
          mostrarHeader: false,
          mostrarFooter: false
        });
      }

      const bdVacia = resultConcesionarios[0].count === 0 && resultVehiculos[0].count === 0;

      res.render('setup', {
        titulo: bdVacia ? 'Configuración inicial' : 'Cargar datos',
        mensaje: null,
        error: null,
        logs: [],
        bdVacia: bdVacia,
        mostrarHeader: !bdVacia,
        mostrarFooter: !bdVacia
      });
    });
  });
});

// Ruta para cargar concesionarios
router.post('/cargar-concesionarios', upload.single('archivo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      error: 'No se ha subido ningún archivo'
    });
  }

  const fs = require('fs');
  const logs = [];

  try {
    // Leer el archivo JSON
    const data = fs.readFileSync(req.file.path, 'utf8');
    const concesionarios = JSON.parse(data);

    if (!Array.isArray(concesionarios)) {
      fs.unlinkSync(req.file.path); // Eliminar archivo temporal
      return res.status(400).json({
        ok: false,
        error: 'El archivo JSON debe contener un array de concesionarios'
      });
    }

    let procesados = 0;
    let errores = 0;
    const total = concesionarios.length;

    // Procesar cada concesionario
    concesionarios.forEach((concesionario, index) => {
      const { id_concesionario,nombre,ciudad,direccion,telefono_contacto} = concesionario;

      if (!id_concesionario || !nombre || !ciudad || !direccion || !telefono_contacto) {
        logs.push(`❌ Registro ${index + 1}: Faltan campos obligatorios (nombre, direccion)`);
        errores++;
        procesados++;
        
        if (procesados === total) {
          finalizarCarga();
        }
        return;
      }

      // Insertar concesionario
      const sql = 'INSERT INTO concesionarios (id_concesionario,nombre,ciudad,direccion,telefono_contacto) VALUES (?, ?, ?, ?,?)';
      db.query(sql, [id_concesionario,nombre,ciudad,direccion,telefono_contacto], (err, result) => {
        if (err) {
          logs.push(`❌ Error al insertar "${nombre}": ${err.message}`);
          errores++;
        } else {
          logs.push(`✅ Concesionario "${nombre}" añadido correctamente (ID: ${result.insertId})`);
        }
        
        procesados++;
        if (procesados === total) {
          finalizarCarga();
        }
      });
    });

    function finalizarCarga() {
      fs.unlinkSync(req.file.path); // Eliminar archivo temporal

      res.json({
        ok: true,
        mensaje: `Proceso completado: ${total - errores} añadidos, ${errores} errores`,
        logs: logs,
        total: total,
        exitosos: total - errores,
        errores: errores
      });
    }

  } catch (error) {
    fs.unlinkSync(req.file.path); // Eliminar archivo temporal
    console.error('Error al procesar archivo:', error);
    return res.status(500).json({
      ok: false,
      error: 'Error al procesar el archivo JSON: ' + error.message
    });
  }
});

// Ruta para cargar vehículos
router.post('/cargar-vehiculos', upload.single('archivo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      error: 'No se ha subido ningún archivo'
    });
  }

  const fs = require('fs');
  const logs = [];

  try {
    // Leer el archivo JSON
    const data = fs.readFileSync(req.file.path, 'utf8');
    const vehiculos = JSON.parse(data);

    if (!Array.isArray(vehiculos)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        ok: false,
        error: 'El archivo JSON debe contener un array de vehículos'
      });
    }

    let procesados = 0;
    let añadidos = 0;
    let actualizados = 0;
    let errores = 0;
    const total = vehiculos.length;
    const vehiculosConflicto = [];

    // Procesar cada vehículo
    vehiculos.forEach((vehiculo, index) => {
      const { matricula, marca, modelo, anio_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario } = vehiculo;

      // Validar campos obligatorios
      if (!matricula || !marca || !modelo || !anio_matriculacion || !numero_plazas || !autonomia_km || !color || !imagen || !estado || !id_concesionario) {
        logs.push(`❌ Registro ${index + 1}: Faltan campos obligatorios (matricula, marca, modelo, anio_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario)`);
        errores++;
        procesados++;
        
        if (procesados === total) {
          finalizarCarga();
        }
        return;
      }

      // Verificar si el vehículo ya existe
      db.query('SELECT * FROM vehiculos WHERE matricula = ?', [matricula], (err, existentes) => {
        if (err) {
          logs.push(`❌ Error al verificar "${matricula}": ${err.message}`);
          errores++;
          procesados++;
          
          if (procesados === total) {
            finalizarCarga();
          }
          return;
        }

        if (existentes.length > 0) {
          // Vehículo existe - guardar para confirmación
          vehiculosConflicto.push({
            matricula: matricula,
            marca: marca,
            modelo: modelo,
            datos: vehiculo
          });
          logs.push(`⚠️ El vehículo con matrícula "${matricula}" ya existe en la base de datos`);
          procesados++;
          
          if (procesados === total) {
            finalizarCarga();
          }
        } else {
          // Vehículo nuevo - insertar
          const sql = `INSERT INTO vehiculos (matricula, marca, modelo, anio_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          
          db.query(sql, [
            matricula,
            marca,
            modelo,
            anio_matriculacion || null,
            numero_plazas || null,
            autonomia_km || null,
            color || null,
            imagen || null,
            estado || 'disponible',
            id_concesionario || null
          ], (err, result) => {
            if (err) {
              logs.push(`❌ Error al insertar "${matricula}": ${err.message}`);
              errores++;
            } else {
              logs.push(`✅ Vehículo "${marca} ${modelo}" (${matricula}) añadido correctamente (ID: ${result.insertId})`);
              añadidos++;
            }
            
            procesados++;
            if (procesados === total) {
              finalizarCarga();
            }
          });
        }
      });
    });

    function finalizarCarga() {
      fs.unlinkSync(req.file.path); // Eliminar archivo temporal

      if (vehiculosConflicto.length > 0) {
        // Hay vehículos que ya existen
        res.json({
          ok: true,
          requiereConfirmacion: true,
          mensaje: `Se encontraron ${vehiculosConflicto.length} vehículos existentes`,
          logs: logs,
          vehiculosConflicto: vehiculosConflicto,
          estadisticas: {
            total: total,
            añadidos: añadidos,
            actualizados: actualizados,
            pendientes: vehiculosConflicto.length,
            errores: errores
          }
        });
      } else {
        // Todo procesado sin conflictos
        res.json({
          ok: true,
          mensaje: `Proceso completado: ${añadidos} añadidos, ${errores} errores`,
          logs: logs,
          estadisticas: {
            total: total,
            añadidos: añadidos,
            actualizados: actualizados,
            errores: errores
          }
        });
      }
    }

  } catch (error) {
    fs.unlinkSync(req.file.path);
    console.error('Error al procesar archivo:', error);
    return res.status(500).json({
      ok: false,
      error: 'Error al procesar el archivo JSON: ' + error.message
    });
  }
});

// Ruta para actualizar vehículos existentes
router.post('/actualizar-vehiculos', express.json(), (req, res) => {
  const { vehiculos } = req.body;

  if (!vehiculos || !Array.isArray(vehiculos)) {
    return res.status(400).json({
      ok: false,
      error: 'Datos inválidos'
    });
  }

  const logs = [];
  let procesados = 0;
  let actualizados = 0;
  let errores = 0;
  const total = vehiculos.length;

  vehiculos.forEach((vehiculo) => {
    const { matricula, marca, modelo, anio_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario } = vehiculo;

    const sql = `UPDATE vehiculos SET 
                 marca = ?, modelo = ?, anio_matriculacion = ?, numero_plazas = ?, 
                 autonomia_km = ?, color = ?, imagen = ?, estado = ?, id_concesionario = ?
                 WHERE matricula = ?`;

    db.query(sql, [
      marca, modelo, anio_matriculacion, numero_plazas, autonomia_km, 
      color, imagen, estado || 'disponible', id_concesionario, matricula
    ], (err, result) => {
      if (err) {
        logs.push(`❌ Error al actualizar "${matricula}": ${err.message}`);
        errores++;
      } else {
        logs.push(`🔄 Vehículo "${marca} ${modelo}" (${matricula}) actualizado correctamente`);
        actualizados++;
      }

      procesados++;
      if (procesados === total) {
        res.json({
          ok: true,
          mensaje: `Actualización completada: ${actualizados} actualizados, ${errores} errores`,
          logs: logs,
          estadisticas: {
            total: total,
            actualizados: actualizados,
            errores: errores
          }
        });
      }
    });
  });
});

module.exports = router;