import { auth, db } from "./firebase-config.js";
import { estadoAutenticacion, obtenerRolUsuario, cerrarSesion } from "./authentication.js";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let guiaEditando = null;
let esAdmin = false;

//-------------------Variables de elementos del DOM-------------------
const listaGuias = document.getElementById("listaGuias");
const btnNuevaGuia = document.getElementById("btnNuevaGuia");

const menuSinSesion = document.querySelectorAll(".menuSinSesion");
const menuConSesion = document.querySelectorAll(".menuConSesion");
const btnLogoutGuias = document.getElementById("btnLogoutGuias");

const formGuia = document.getElementById("formGuia");
const tituloGuia = document.getElementById("tituloGuia");
const resumenGuia = document.getElementById("resumenGuia");
const imagenGuia = document.getElementById("imagenGuia");
const contenidoGuia = document.getElementById("contenidoGuia");
const modalGuiaLabel = document.getElementById("modalGuiaLabel");

const modalGuiaEl = document.getElementById("modalGuia");
const modalGuia = bootstrap.Modal.getOrCreateInstance(modalGuiaEl);

const modalVerGuiaEl = document.getElementById("modalVerGuia");
const modalVerGuia = bootstrap.Modal.getOrCreateInstance(modalVerGuiaEl);
const verGuiaTitulo = document.getElementById("verGuiaTitulo");
const verGuiaImagen = document.getElementById("verGuiaImagen");
const verGuiaContenido = document.getElementById("verGuiaContenido");

//-------------------Cargar y pintar las guías-------------------
async function cargarGuias() {

    listaGuias.innerHTML = "";

    const consulta = query(collection(db, "guias"), orderBy("fechaCreacion", "desc"));
    const snapshot = await getDocs(consulta);

    if (snapshot.empty) {
        listaGuias.innerHTML = `
            <div class="col-12">
                <p class="text-center text-muted">
                    <i class="bi bi-info-circle me-1"></i>Aún no hay guías publicadas.
                </p>
            </div>
        `;
        return;
    }

    snapshot.forEach((docSnap) => {

        const guia = docSnap.data();
        const id = docSnap.id;

        listaGuias.innerHTML += `
            <div class="col">
                <div class="card h-100 zoom guia-card" data-id="${id}" role="button">
                    <img src="${guia.imagen}" class="card-img-top" alt="${guia.titulo}"
                        style="height: 160px; object-fit: cover;"
                        onerror="this.src='./media/images/logo.png'">
                    <div class="card-body">
                        <h5 class="card-title">${guia.titulo}</h5>
                        <p class="card-text">${guia.resumen}</p>
                    </div>
                    <div class="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
                        <span class="btn btn-outline-success btn-sm disabled">Ver guía</span>
                        ${esAdmin ? `
                        <span>
                            <button type="button" class="btn btn-warning btn-sm btnEditarGuia" data-id="${id}">
                                <i class="bi bi-pencil-fill"></i>
                            </button>
                            <button type="button" class="btn btn-danger btn-sm btnEliminarGuia" data-id="${id}">
                                <i class="bi bi-trash3-fill"></i>
                            </button>
                        </span>` : ``}
                    </div>
                </div>
            </div>
        `;
    });
}

//-------------------Clicks sobre las tarjetas (ver / editar / eliminar)-------------------
listaGuias.addEventListener("click", async (e) => {

    // EDITAR
    if (e.target.closest(".btnEditarGuia")) {
        e.stopPropagation();

        guiaEditando = e.target.closest(".btnEditarGuia").dataset.id;
        const docSnap = await getDoc(doc(db, "guias", guiaEditando));

        if (docSnap.exists()) {
            const guia = docSnap.data();
            tituloGuia.value = guia.titulo;
            resumenGuia.value = guia.resumen;
            imagenGuia.value = guia.imagen;
            contenidoGuia.value = guia.contenido;
            modalGuiaLabel.innerText = "Editar guía";
        }

        modalGuia.show();
        return;
    }

    // ELIMINAR
    if (e.target.closest(".btnEliminarGuia")) {
        e.stopPropagation();

        const id = e.target.closest(".btnEliminarGuia").dataset.id;

        const resultado = await Swal.fire({
            title: "¿Eliminar guía?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });

        if (!resultado.isConfirmed) return;

        await deleteDoc(doc(db, "guias", id));
        await cargarGuias();

        Swal.fire({
            icon: "success",
            title: "Guía eliminada correctamente"
        });
        return;
    }

    // VER GUÍA COMPLETA
    const card = e.target.closest(".guia-card");
    if (card) {
        const id = card.dataset.id;
        const docSnap = await getDoc(doc(db, "guias", id));

        if (docSnap.exists()) {
            const guia = docSnap.data();
            verGuiaTitulo.innerText = guia.titulo;
            verGuiaImagen.src = guia.imagen;
            verGuiaContenido.innerHTML = guia.contenido;
            modalVerGuia.show();
        }
    }
});

//-------------------Guardar / actualizar guía (solo admins)-------------------
formGuia.addEventListener("submit", async (e) => {
    e.preventDefault();

    const datos = {
        titulo: tituloGuia.value,
        resumen: resumenGuia.value,
        imagen: imagenGuia.value,
        contenido: contenidoGuia.value
    };

    try {
        if (guiaEditando == null) {

            datos.fechaCreacion = new Date().toISOString();

            await addDoc(collection(db, "guias"), datos);

            Swal.fire({
                icon: "success",
                title: "Guía publicada",
                text: "La guía se guardó correctamente.",
                confirmButtonColor: "#4CAF50"
            });

        } else {

            await updateDoc(doc(db, "guias", guiaEditando), datos);

            Swal.fire({
                icon: "success",
                title: "Guía actualizada"
            });
        }

        modalGuia.hide();
        formGuia.reset();
        guiaEditando = null;
        await cargarGuias();

    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo guardar la guía."
        });
    }
});

modalGuiaEl.addEventListener("hidden.bs.modal", () => {
    formGuia.reset();
    guiaEditando = null;
    modalGuiaLabel.innerText = "Registrar guía";
});

//-------------------Escuchar cambios en la autenticación-------------------
estadoAutenticacion(async (user) => {

    esAdmin = false;

    if (user) {

        menuSinSesion.forEach((el) => el.classList.add("d-none"));
        menuConSesion.forEach((el) => el.classList.remove("d-none"));

        const rol = await obtenerRolUsuario(user.uid);
        esAdmin = rol === "admin";

    } else {

        menuSinSesion.forEach((el) => el.classList.remove("d-none"));
        menuConSesion.forEach((el) => el.classList.add("d-none"));
    }

    if (esAdmin) {
        btnNuevaGuia.classList.remove("d-none");
    } else {
        btnNuevaGuia.classList.add("d-none");
    }

    await cargarGuias();
});

//-------------------Cerrar sesión desde el menú de guías-------------------
btnLogoutGuias.addEventListener("click", async (e) => {
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
