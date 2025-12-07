const regexMoveit   = /^[^\s@]+@moveit\.es$/;
const regexPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

//Esta función la utilizamos como validador para los campos del formulario tanto del login como del registro
function crearManejadorFormulario(formId, emailId, passwordId, emailErrorId, passErrorId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const email      = document.getElementById(emailId);
  const pass       = document.getElementById(passwordId);
  const emailError = emailErrorId ? document.getElementById(emailErrorId) : null;
  const passError  = passErrorId  ? document.getElementById(passErrorId)  : null;

  function limpiarErrores() {
    if (email) email.classList.remove('error');
    if (pass)  pass.classList.remove('error');
    if (emailError) {
      emailError.textContent = '';
      emailError.classList.remove('activo');
    }
    if (passError) {
      passError.textContent = '';
      passError.classList.remove('activo');
    }
  }

  form.addEventListener('submit', (e) => {
    limpiarErrores();
    let hayErrores = false;

    // 1) Validar formato del correo
    if (!regexMoveit.test(email.value)) {
      hayErrores = true;
      if (email) email.classList.add('error');
      if (emailError) {
        emailError.textContent = 'El correo debe tener el siguiente formato: nombre_usuario@moveit.es';
        emailError.classList.add('activo');
      }
    }

    // 2) Solo en REGISTRO: validar contraseña
    if (form.id === 'form-registro') {
      if (!regexPassword.test(pass.value)) {
        hayErrores = true;
        if (pass) pass.classList.add('error');
        if (passError) {
          passError.textContent = 'La contraseña debe tener mínimo 8 caracteres, 1 mayúscula y 1 número';
          passError.classList.add('activo');
        }
      }
    }

    if (hayErrores) {
      e.preventDefault();
    }
  });

  // Limpia error de correo mientras escribe
  email.addEventListener('input', () => {
    if (regexMoveit.test(email.value)) {
      if (emailError) {
        emailError.textContent = '';
        emailError.classList.remove('activo');
      }
      email.classList.remove('error');
    }
  });

  // Limpia error de contraseña mientras escribe (solo si hay span)
  if (pass && passError) {
    pass.addEventListener('input', () => {
      if (regexPassword.test(pass.value)) {
        passError.textContent = '';
        passError.classList.remove('activo');
        pass.classList.remove('error');
      }
    });
  }
}

// REGISTRO
crearManejadorFormulario(
  'form-registro',
  'email-registro',
  'password-registro',
  'email-error-registro',
  'password-error-registro'
);

// LOGIN
crearManejadorFormulario(
  'form-login',
  'email-login',
  'password-login',
  'email-error-login',
  null
);
