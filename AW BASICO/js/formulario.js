try {
    document.addEventListener("DOMContentLoaded", function () {
        const form = document.querySelector("form");

        const nombre = document.getElementById("nombre");
        const email = document.getElementById("email");
        const fechaini = document.getElementById("fechaini");
        const fechafin = document.getElementById("fechafin");
        const vehiculo = document.getElementById("coches");
        const tipoVehiculo = document.getElementById("tipovehiculo");
        const borrarBtn = document.getElementById("borrarBtn");
        const progress = document.querySelector("progress");
        const vehiculoError = document.getElementById("vehiculoerror");

        const duracion = document.getElementById("duracion");
        const duracionError = document.getElementById("duracionerror");

        const emailError = document.getElementById("emailerror");
        const nombreError = document.getElementById("nombreerror");
        const fechainiError = document.getElementById("fechainierror");
        const fechafinError = document.getElementById("fechafinerror");


        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        let nombreValido = false;
        let emailValido = false;
        let fechasValidas = false;
        let vehiculoValido = false;
        let duracionValida = false;

        function animarProgreso(incremento) {
            const velocidad = 10;
            const barra = progress;
            const objetivo = Math.max(0, Math.min(barra.value + incremento, 100));

            const intervalo = setInterval(() => {
                if ((incremento > 0 && barra.value < objetivo) ||
                    (incremento < 0 && barra.value > objetivo)) {
                    barra.value += incremento > 0 ? 1 : -1;
                } else {
                    clearInterval(intervalo);
                }
            }, velocidad);
        }


        function validarNombre() {
            const valido = nombre.value.trim().length >= 3;

            if (valido && !nombreValido) {
                animarProgreso(20);
                nombreValido = true;
            } else if (!valido && nombreValido) {
                animarProgreso(-20);
                nombreValido = false;
            }

            nombreError.style.display = valido ? "none" : "inline";
            nombre.style.borderColor = valido ? "green" : "red";
            return valido;
        }





        function validarEmail() {
            const valido = emailPattern.test(email.value.trim());

            if (valido && !emailValido) {
                animarProgreso(20);
                emailValido = true;
            } else if (!valido && emailValido) {
                animarProgreso(-20);
                emailValido = false;
            }

            emailError.style.display = valido ? "none" : "inline";
            email.style.borderColor = valido ? "green" : "red";

            return valido;
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

            // Controla si cambia el estado
            if (valido && !fechasValidas) {
                animarProgreso(20);
                fechasValidas = true;
            } else if (!valido && fechasValidas) {
                animarProgreso(-20);
                fechasValidas = false;
            }

            return valido;
        }



        function validarDuracion() {
            const valor = parseFloat(duracion.value);
            const valido = !isNaN(valor) && valor > 0;

            if (valido && !duracionValida) {
                animarProgreso(20);
                duracionValida = true;
            } else if (!valido && duracionValida) {
                animarProgreso(-20);
                duracionValida = false;
            }

            duracionError.style.display = valido ? "none" : "inline";
            duracion.style.borderColor = valido ? "green" : "red";

            return valido;
        }

        function validarVehiculo() {
            const valido = tipoVehiculo.value !== "";

            if (valido && !vehiculoValido) {
                animarProgreso(20);
                vehiculoValido = true;
            } else if (!valido && vehiculoValido) {
                animarProgreso(-20);
                vehiculoValido = false;
            }

            vehiculoError.style.display = valido ? "none" : "inline";
            tipoVehiculo.style.borderColor = valido ? "green" : "red";

            return valido;
        }




        borrarBtn.addEventListener("click", () => {
            form.reset();
            // Elimina clases de validación
            const campos = form.querySelectorAll("input, select");
            campos.forEach(campo => {
                campo.classList.remove("valid", "invalid");
            });
            // Oculta todos los mensajes de error
            const errores = form.querySelectorAll(".error");
            errores.forEach(err => (err.style.display = "none"));

        });


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
                form.submit();
            } else {
                console.log("Formulario inválido. Corrige los errores.");
            }
        });
    });
} catch (error) {
    console.error("Error al cargar el script:", error);
}
