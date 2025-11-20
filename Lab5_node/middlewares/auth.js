function requireAuth(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }

  res.render("index", {
    message: "Para acceder a esta zona debes iniciar sesión.",
    usuario: null
  });
}

module.exports = requireAuth;
