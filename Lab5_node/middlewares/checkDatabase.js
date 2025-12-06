const db = require('../public/js/conexion');

const checkDatabase = (req, res, next) => {
  // Solo verificar en rutas específicas (evitar loops infinitos)
  if (req.path === '/setup' || req.path.startsWith('/setup/')) {
    return next();
  }

  // Verificar si hay datos en las tablas principales
  db.query('SELECT COUNT(*) as count FROM concesionarios', (err, resultConcesionarios) => {
    if (err) {
      console.error("Error al verificar base de datos:", err);
      return next();
    }

    db.query('SELECT COUNT(*) as count FROM vehiculos', (err2, resultVehiculos) => {
      if (err2) {
        console.error("Error al verificar base de datos:", err2);
        return next();
      }

      const totalConcesionarios = resultConcesionarios[0].count;
      const totalVehiculos = resultVehiculos[0].count;

      // Si la base de datos está vacía, redirigir a setup
      if (totalConcesionarios === 0 && totalVehiculos === 0) {
        return res.redirect('/setup');
      }

      next();
    });
  });
};

module.exports = checkDatabase;