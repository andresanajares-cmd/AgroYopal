import { iniciarSesion } from "./authentication.js";


const inputEmail = document.getElementById("LoginEmail");
const inputPsw = document.getElementById("LoginPassword");
const btnLogin = document.getElementById("btnLogin");


btnLogin.addEventListener("click", async (e) => {
    e.preventDefault();

    try {

        const credencial = await iniciarSesion(
            inputEmail.value,
            inputPsw.value
        );
        console.log("Bienvenido", credencial.user.email);
        Swal.fire({
            icon: "success",
            title: "¡Bienvenido!",
            text: "Inicio de sesión exitoso.",
            confirmButtonColor: "#4CAF50"
        });

        window.location.href = "dashboard.html";

    } catch (error) {

        switch (error.code) {

        case "auth/invalid-credential":
            Swal.fire({
                icon: "error",
                title: "No se pudo iniciar sesión",
                text: "El correo o la contraseña son incorrectos.",
                confirmButtonColor: "#4CAF50"
            });
            break;

        case "auth/invalid-email":
            Swal.fire({
                icon: "error",
                title: "Correo inválido",
                text: "Ingresa un correo electrónico válido.",
                confirmButtonColor: "#4CAF50"
            });
            break;

        case "auth/too-many-requests":
            Swal.fire({
                icon: "warning",
                title: "Demasiados intentos",
                text: "Tu cuenta fue bloqueada temporalmente. Intenta nuevamente más tarde.",
                confirmButtonColor: "#4CAF50"
            });
            break;

        case "auth/network-request-failed":
            Swal.fire({
                icon: "error",
                title: "Sin conexión",
                text: "Verifica tu conexión a Internet.",
                confirmButtonColor: "#4CAF50"
            });
            break;

        default:
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Ocurrió un error inesperado.",
                confirmButtonColor: "#4CAF50"
            });
    }

    }

});