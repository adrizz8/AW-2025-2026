
//Middleware para comprobar la si la base de datos esta vacía de cara a redireccionar a la página de setup o al index

const db = require('../public/js/conexion');

const checkDatabase = (req, res, next) => {
  // Solo verificamos en rutas específicas (para evitar loops infinitos)
  if (req.path === '/setup' || req.path.startsWith('/setup/')) {
    return next();
  }

  //Las dos consultas para comprobar que tanto la tabla de concesionarios como la de vehiculos estan vacias
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

      // Si ambas estan vacias redirigimos a setup
      if (totalConcesionarios === 0 && totalVehiculos === 0) {
        return res.redirect('/setup');
      }

      next();
    });
  });
};

module.exports = checkDatabase;