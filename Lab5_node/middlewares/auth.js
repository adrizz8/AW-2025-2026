function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
   res.render('index', {message: "Para acceder a la zona de reservas, debes iniciar sesión"});  }
}

module.exports = requireAuth;
