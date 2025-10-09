try {
    document.addEventListener("DOMContentLoaded", function () {
        const form = document.querySelector("form");
        form.addEventListener("submit", function (event) {
            event.preventDefault(); // Evita el envío del formulario por defecto
            // Validar campos del formulario
            const nombre = document.getElementById("nombre").value;
            const email = document.getElementById("email").value;
            const fechaini = document.getElementById("fechaini").value;
            const fechafin = document.getElementById("fechafin").value;
            const vehiculo = document.getElementById("coches").value;

            const emailError = document.getElementById("emailerror");
            const nombreerror = document.getElementById("nombreerror");
            const fechainiError = document.getElementById("fechainierror");
            const fechafinError = document.getElementById("fechafinerror");

            nombreerror.style.display = "none";
            emailError.style.display = "none";
            fechainiError.style.display = "none";
            fechafinError.style.display = "none";

            if (nombre.length < 3) {
                nombreerror.style.display = "inline";
                return;
            }

            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (!emailPattern.test(email)) {
                emailError.style.display="inline";
                return;
            }

            if (new Date(fechaini) > new Date(fechafin)) {
                fechafinError.style.display="inline";
                return;
            }

        });

    });

}

catch (error) {
            console.error("Error al cargar el script:", error);
        }