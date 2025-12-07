const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../public/js/conexion'); 

const SALT_ROUNDS = 10;

//Rutas generales de registro y login

// --- Creamos un usuario admin maestro por defecto ---
(async () => {
  try {
    // Verificamos si ya existe el admin
    db.query('SELECT * FROM usuarios WHERE correo = ?', ['admin@moveit.es'], async (err, adminExistente) => {
      if (err) {
        console.error("Error al verificar usuario admin:", err);
        return;
      }

      if (adminExistente.length === 0) {
        const hashedPass = await bcrypt.hash("admin123", SALT_ROUNDS);
        db.query(
          'INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES (?, ?, ?, ?)',
          ['Admin', 'admin@moveit.es', hashedPass, 'admin'],
          (err, result) => {
            if (err) {
              console.error("Error al crear usuario admin:", err);
            } else {
              console.log("✔ Usuario admin creado por defecto");
            }
          }
        );
      } else {
        console.log("✔ Usuario admin ya existe");
      }
    });
  } catch (error) {
    console.error("Error al crear usuario admin:", error);
  }
})();

// --- Middleware que utilizamos para recordar sesion
router.use((req, res, next) => {
  if (!req.session.usuario && req.cookies.usuarioRecordado) {
    db.query(
      'SELECT * FROM usuarios WHERE correo = ?',
      [req.cookies.usuarioRecordado],
      (err, usuarios) => {
        if (err) {
          console.error("Error al recuperar usuario recordado:", err);
          return next();
        }
        
        if (usuarios.length > 0) {
          req.session.usuario = usuarios[0];
        }
        next();
      }
    );
  } else {
    next();
  }
});

// --- Index
router.get('/', (req, res) => {
  const authWarning = res.locals.authWarning || null;
  res.locals.authWarning = null;
  res.render('index', {
    titulo: 'Inicio',
    usuario: req.session.usuario || null,
    authWarning,
    mostrarHeader: true,
    mostrarFooter: true
  });
});

// --- Registro (GET) ---
router.get('/registro', (req, res) => {
  // Obtenemos concesionarios de la base de datos
  db.query('SELECT id_concesionario, nombre FROM concesionarios WHERE activo = 1 ORDER BY nombre ASC', (err, concesionarios) => {
    if (err) {
      console.error("Error al cargar concesionarios:", err);
      return res.render('registro', {
        titulo: 'Registro',
        error: '⚠ Error al cargar el formulario.',
        concesionarios: [],
        mostrarHeader: false,
        mostrarFooter: false
      });
    }
    
    res.render('registro', {
      titulo: 'Registro',
      error: null,
      concesionarios: concesionarios,
      mostrarHeader: false,
      mostrarFooter: false
    });
  });
});

// --- Registro (POST) ---
router.post('/registro', (req, res) => {
  const { nombre, email, contraseña, telefono, concesionarios, preferencias_accesibilidad,rol } = req.body;
  
  // Verificamos si el usuario ya existe
  db.query('SELECT * FROM usuarios WHERE correo = ?', [email], (err, usuarioExistente) => {
    if (err) {
      console.error("Error en el registro:", err);
      // Recargamos concesionarios en caso de error
      db.query('SELECT id_concesionario, nombre FROM concesionarios ORDER BY nombre ASC', (err2, concesionariosLista) => {
        res.render('registro', {
          titulo: 'Registro',
          error: '⚠ Error al registrar el usuario. Inténtelo de nuevo.',
          concesionarios: err2 ? [] : concesionariosLista,
          mostrarHeader: false,
          mostrarFooter: false
        });
      });
      return;
    }

    if (usuarioExistente.length > 0) {
      // Recargamos concesionarios en caso de error
      db.query('SELECT id_concesionario, nombre FROM concesionarios ORDER BY nombre ASC', (err, concesionariosLista) => {
        res.render('registro', {
          titulo: 'Registro',
          error: '⚠ El usuario ya está registrado.',
          concesionarios: err ? [] : concesionariosLista,
          mostrarHeader: false,
          mostrarFooter: false
        });
      });
      return;
    }

    // Hasheamos la contraseña
    bcrypt.hash(contraseña, SALT_ROUNDS, (err, hash) => {
      if (err) {
        console.error("Error al hashear contraseña:", err);
        db.query('SELECT id_concesionario, nombre FROM concesionarios ORDER BY nombre ASC', (err2, concesionariosLista) => {
          res.render('registro', {
            titulo: 'Registro',
            error: '⚠ Error al procesar la contraseña.',
            concesionarios: err2 ? [] : concesionariosLista,
            mostrarHeader: false,
            mostrarFooter: false
          });
        });
        return;
      }


      const sql = `INSERT INTO usuarios (nombre, correo, contraseña, telefono, id_concesionario, preferencias_accesibilidad, rol, activo) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      const params = [
        nombre,
        email,
        hash,
        telefono,
        concesionarios,
        preferencias_accesibilidad || null,
        rol,
        1
      ];

      db.query(sql, params, (err, result) => {
        if (err) {
          console.error("Error al insertar usuario:", err);
          db.query('SELECT id_concesionario, nombre FROM concesionarios ORDER BY nombre ASC', (err2, concesionariosLista) => {
            res.render('registro', {
              titulo: 'Registro',
              error: '⚠ Error al registrar el usuario. Inténtelo de nuevo.',
              concesionarios: err2 ? [] : concesionariosLista,
              mostrarHeader: false,
              mostrarFooter: false
            });
          });
          return;
        }
        res.redirect('/');
      });
    });
  });
});

// --- Login (GET) ---
router.get('/login', (req, res) => {
  res.render('login', {
    titulo: 'Iniciar sesión',
    errorLogin: null,
    mostrarHeader: false,
    mostrarFooter: false
  });
});

// --- Login (POST) ---
router.post('/login', (req, res) => {
  const { email, contraseña, recordar } = req.body;
  
  // Buscamos usuario en la base de datos
  db.query('SELECT * FROM usuarios WHERE correo = ? AND activo = 1', [email], (err, usuarios) => {
    if (err) {
      console.error("Error en el login:", err);
      return res.render('login', {
        titulo: 'Iniciar sesión',
        errorLogin: '⚠ Error al iniciar sesión. Inténtelo de nuevo.',
        mostrarHeader: false,
        mostrarFooter: false
      });
    }

    if (usuarios.length === 0) {
      return res.render('login', {
        titulo: 'Iniciar sesión',
        errorLogin: 'Usuario no encontrado. Inténtelo de nuevo.',
        mostrarHeader: false,
        mostrarFooter: false
      });
    }

    const usuario = usuarios[0];

    // Verificamos contraseña
    bcrypt.compare(contraseña, usuario.contraseña, (err, esValida) => {
      if (err) {
        console.error("Error al comparar contraseñas:", err);
        return res.render('login', {
          titulo: 'Iniciar sesión',
          errorLogin: '⚠️ Error al verificar la contraseña.',
          mostrarHeader: false,
          mostrarFooter: false
        });
      }

      if (!esValida) {
        return res.render('login', {
          titulo: 'Iniciar sesión',
          errorLogin: 'Contraseña incorrecta. Inténtelo de nuevo.',
          mostrarHeader: false,
          mostrarFooter: false
        });
      }

      // Guardar usuario en sesión (sin la contraseña)
      const { contraseña: _, ...usuarioSinPassword } = usuario;
      req.session.usuario = usuarioSinPassword;

      // Guardar cookie si el usuario quiere "recordar sesión"
      if (recordar) {
        res.cookie("usuarioRecordado", usuario.correo, {
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
          httpOnly: true
        });
      }

      res.redirect('/');
    });
  });
});

// --- Logout ---
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('usuarioRecordado');
    res.redirect('/');
  });
});

module.exports = router;