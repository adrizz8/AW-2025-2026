module.exports = function(req, res, next) {
  if (!req.session.usuario || req.session.usuario.rol !== "admin") {
    return res.status(403).render("403", {
      mensaje: "Acceso denegado. Solo administradores."
    });
  }
  next();
};
