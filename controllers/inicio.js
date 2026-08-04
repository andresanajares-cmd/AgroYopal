import { auth } from "./firebase-config.js";
import { estadoAutenticacion, cerrarSesion } from "./authentication.js";

//-------------------Variables de elementos del DOM-------------------
const menuSinSesion = document.querySelectorAll(".menuSinSesion");
const menuConSesion = document.querySelectorAll(".menuConSesion");
const btnLogoutIndex = document.getElementById("btnLogoutIndex");

//-------------------Escuchar cambios en la autenticación-------------------
estadoAutenticacion((user) => {

    if (user) {

        menuSinSesion.forEach((el) => el.classList.add("d-none"));
        menuConSesion.forEach((el) => el.classList.remove("d-none"));

    } else {

        menuSinSesion.forEach((el) => el.classList.remove("d-none"));
        menuConSesion.forEach((el) => el.classList.add("d-none"));
    }
});

//-------------------Cerrar sesión desde el menú de inicio-------------------
btnLogoutIndex.addEventListener("click", async (e) => {
    e.preventDefault();

    const resultado = await Swal.fire({
        title: "¿Cerrar sesión?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "Cancelar"
    });

    if (!resultado.isConfirmed) return;

    try {
        await cerrarSesion(auth);
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error al cerrar sesión"
        });
    }
});


//ScrollReveal
AOS.init();