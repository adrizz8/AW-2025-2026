// Usamos este middleware para bloquear el acceso a rutas a los usuarios que no son administradores 

module.exports = function(req, res, next) {
  if (!req.session.usuario || req.session.usuario.rol !== "admin") {
    return res.status(404).render("404", {
      mensaje: "Acceso denegado. Solo administradores."
    });
  }
  next();
};
