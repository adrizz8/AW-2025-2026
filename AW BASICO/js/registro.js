try {
    document.addEventListener("DOMContentLoaded", function () {
        const form = document.querySelector("form");
        const password = document.getElementById("password");
        const passwordError = document.getElementById("passworderror");


        // Función de validación de contraseña

        function validarPassword() {
              const pattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]|:;"'<>,.?/]).{8,}$/;

            if (!pattern.test(password.value)) {
                   passwordError.style.display = "inline";
                   return false;
            } else {
                   passwordError.style.display = "none";
                   return true;
            }

        }

        password.addEventListener("input", validarPassword);

    
       


        // Validación al enviar
        form.addEventListener("submit", function (event) {

            event.preventDefault();
            const passwordValido = validarPassword();

            if (passwordValido) {
                form.submit();
            }

        });
    });
} catch (error) {
    console.error("Error al cargar el script:", error);
}
