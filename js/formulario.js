try {
    document.addEventListener("DOMContentLoaded", function () {
        const form = document.querySelector("form");

        const nombre = document.getElementById("nombre");
        const email = document.getElementById("email");
        const fechaini = document.getElementById("fechaini");
        const fechafin = document.getElementById("fechafin");
        const vehiculo = document.getElementById("coches");
        const tipoVehiculo = document.getElementById("tipovehiculo");
        const vehiculoError = document.getElementById("vehiculoerror");

        const duracion = document.getElementById("duracion");
        const duracionError = document.getElementById("duracionerror");

        const emailError = document.getElementById("emailerror");
        const nombreError = document.getElementById("nombreerror");
        const fechainiError = document.getElementById("fechainierror");
        const fechafinError = document.getElementById("fechafinerror");

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        // Funciones de validación
        function validarNombre() {
            if (nombre.value.trim().length < 3) {
                nombreError.style.display = "inline";
                nombre.style.borderColor = "red";
                return false;
            } else {
                nombreError.style.display = "none";
                nombre.style.borderColor = "green";
                return true;
            }
        }

        function validarEmail() {
            if (!emailPattern.test(email.value.trim())) {
                emailError.style.display = "inline";
                email.style.borderColor = "red";
                return false;
            } else {
                emailError.style.display = "none";
                email.style.borderColor = "green";
                return true;
            }
        }

        function validarFechas() {
            const fechaInicio = new Date(fechaini.value);
            const fechaFin = new Date(fechafin.value);
            let valido = true;

            if (fechaini.value === "") {
                fechainiError.textContent = "Introduce una fecha de inicio.";
                fechainiError.style.display = "inline";
                fechaini.style.borderColor = "red";
                valido = false;
            } else {
                fechainiError.style.display = "none";
                fechaini.style.borderColor = "green";
            }

            if (fechafin.value === "") {
                fechafinError.textContent = "Introduce una fecha de fin.";
                fechafinError.style.display = "inline";
                fechafin.style.borderColor = "red";
                valido = false;
            } else if (fechaInicio > fechaFin) {
                fechafinError.textContent = "La fecha de fin debe ser posterior a la de inicio.";
                fechafinError.style.display = "inline";
                fechafin.style.borderColor = "red";
                valido = false;
            } else {
                fechafinError.style.display = "none";
                fechafin.style.borderColor = "green";
            }

            return valido;
        }

        function validarDuracion() {
            const valor = parseFloat(duracion.value);

            if (isNaN(valor) || valor <= 0) {
                duracion.classList.add("invalid");
                duracion.classList.remove("valid");
                duracionError.style.display = "inline";
                return false;
            } else {
                duracion.classList.add("valid");
                duracion.classList.remove("invalid");
                duracionError.style.display = "none";
                return true;
            }
        }

        function validarVehiculo() {
            if (tipoVehiculo.value === "") {
                tipoVehiculo.classList.add("invalid");
                tipoVehiculo.classList.remove("valid");
                vehiculoError.style.display = "inline";
                return false;
            } else {
                tipoVehiculo.classList.add("valid");
                tipoVehiculo.classList.remove("invalid");
                vehiculoError.style.display = "none";
                return true;
            }
        }

        // Validación en tiempo real
        nombre.addEventListener("input", validarNombre);
        email.addEventListener("input", validarEmail);
        fechaini.addEventListener("change", validarFechas);
        fechafin.addEventListener("change", validarFechas);
        tipoVehiculo.addEventListener("change", validarVehiculo);
        duracion.addEventListener("input", validarDuracion);


        // Validación al enviar
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const nombreValido = validarNombre();
            const emailValido = validarEmail();
            const fechasValidas = validarFechas();
            const vehiculoValido = validarVehiculo();
              const duracionValida = validarDuracion();

            if (nombreValido && emailValido && fechasValidas && duracionValida && vehiculoValido) {
                console.log("Formulario válido. Enviando...");
                // form.submit(); // Descomenta si quieres enviarlo realmente
            } else {
                console.log("Formulario inválido. Corrige los errores.");
            }
        });
    });
} catch (error) {
    console.error("Error al cargar el script:", error);
}
