function requireAuth(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }

  return res.redirect('/login?error=Debes iniciar sesión para continuar');
}

module.exports = requireAuth;
