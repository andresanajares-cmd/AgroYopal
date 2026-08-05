import { registrarUsuario } from "./authentication.js";


const inputEmail = document.getElementById("registroEmail");
const inputPsw = document.getElementById("registroPassword");
const btnRegistrar = document.getElementById("btnRegistro");
const inputConfirmarPsw = document.getElementById("registroConfirmarPassword");

function validarContrasena(password, confirmarPassword) {

    let num = 0;
    let caracteres = 0;

    if (password.length < 6) {
        return {
            valido: false,
            mensaje: "La contraseña debe tener al menos 6 caracteres."
        };
    }

    for (let i = 0; i < password.length; i++) {
        if (password[i] === " ") {
            return {
                valido: false,
                mensaje: "La contraseña no puede contener espacios."
            };
        }
        if (/[a-zA-Z]/.test(password[i])) {
            caracteres++;
        } else if (/\d/.test(password[i])) { // \d busca dígitos del 0 al 9
            num++;
        }
    }

    if (caracteres < 1 || num < 1) {
        return {
            valido: false,
            mensaje: "La contraseña debe tener al menos una letra y un número."
        };
    }



    if (password !== confirmarPassword) {
        return {
            valido: false,
            mensaje: "Las contraseñas no coinciden."
        };
    }

    return {
        valido: true
    };
}

btnRegistrar.addEventListener("click", async (e) => {
    e.preventDefault();



    const validacion = validarContrasena(
        inputPsw.value,
        inputConfirmarPsw.value
    );

    if (!validacion.valido) {

         Swal.fire({
            icon: "error",
            title: "Error",
            text: validacion.mensaje
        });

        return; // Detiene el registro
    }
    try {

        const credencial = await registrarUsuario(
            inputEmail.value,
            inputPsw.value
        );

        console.log("Usuario creado:", credencial.user.email);
        await Swal.fire({
            icon: "success",
            title: "¡Bienvenido!",
            text: "Usuario registrado correctamente, inicia sesion.",
            confirmButtonColor: "#4CAF50"
        });

        window.location.href = "login.html";

    } catch (error) {

        switch (error.code) {

            case "auth/email-already-in-use":
                Swal.fire({
                    icon: "warning",
                    title: "Error",
                    text: "Este correo ya está registrado.",
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonColor: "#4CAF50",
                    cancelButtonColor: "#157d2c",
                    confirmButtonText: "Inicia sesión",
                    cancelButtonText: "Intenta con otro correo"
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = "login.html";
                    }
                });
                break;

            default:

                
        console.log("Usuario creado:", credencial.user.email);
        await Swal.fire({
            icon: "success",
            title: "¡Bienvenido!",
            text: "Usuario registrado correctamente, inicia sesion.",
            confirmButtonColor: "#4CAF50"
        });

        window.location.href = "login.html";
        }


    }

});

  AOS.init();
