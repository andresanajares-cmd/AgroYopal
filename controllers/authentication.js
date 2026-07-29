//importar la configuracion de firebase
import { auth, db } from "./firebase-config.js";


 //importar funciones de firebase
 import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

//---------Funciones Separadas para manejar la autenticación de usuarios

// Registrar usuario
export async function registrarUsuario(email, password) {

    const credencial = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    // Se crea el documento del usuario en Firestore con rol "cliente" por defecto.
    // Para convertir una cuenta en administrador, cambia manualmente el campo
    // "rol" a "admin" en la colección "usuarios" desde la consola de Firebase.
    await setDoc(doc(db, "usuarios", credencial.user.uid), {
        email: email,
        rol: "cliente"
    });

    return credencial;
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

// Obtener el rol del usuario ("admin" o "cliente") desde Firestore
export async function obtenerRolUsuario(uid) {

    const docSnap = await getDoc(doc(db, "usuarios", uid));

    if (docSnap.exists()) {
        return docSnap.data().rol;
    }

    return "cliente";
}
