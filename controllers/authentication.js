//importar la configuracion de firebase
import { auth } from "./firebase-config.js";


 //importar funciones de firebase
 import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

//---------Funciones Separadas para manejar la autenticación de usuarios

// Registrar usuario
export async function registrarUsuario(email, password) {
    return await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );
}

//Iniciar sesion
export async function iniciarSesion(email, password) {
    return await signInWithEmailAndPassword(
        auth,
        email,
        password
    );
}

// Cerrar sesión
export async function cerrarSesion() {
    return await signOut(auth);
}

// Escuchar si hay un usuario autenticado
export function estadoAutenticacion(callback) {
    onAuthStateChanged(auth, callback);
}