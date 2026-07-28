import { auth, db } from "./firebase-config.js";
import { estadoAutenticacion } from "./authentication.js";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

import { cerrarSesion } from "./authentication.js";

let cultivoEditando = null;
//-------------------Variables de elementos del DOM-------------------
const formCultivo = document.getElementById("formCultivo");

const tipoCultivo = document.getElementById("tipoCultivo");
const fechaSiembra = document.getElementById("fechaSiembra");
const areaCultivo = document.getElementById("areaCultivo");
const estadoCultivo = document.getElementById("estadoCultivo");
const observacionesCultivo = document.getElementById("observacionesCultivo");
const tablaCultivos = document.getElementById("tablaCultivos");
const estadoVacio = document.getElementById("estadoVacio");
const filtroEstado = document.getElementById("filtroEstado");
const modal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("modalCultivo")
);


//contadores




//|-------------------Funciones para manejar la base de datos-------------------
// Función para cargar los cultivos del usuario autenticado
async function cargarEstadisticas(uid) {

    let cultivosTotales = 0;
    let sembrados = 0;
    let enCrecimiento = 0;
    let cosechados = 0;

    const consulta = query(
        collection(db, "cultivos"),
        where("uid", "==", uid)
    );

    const snapshot = await getDocs(consulta);

    snapshot.forEach((doc) => {

        const cultivo = doc.data();

        cultivosTotales++;

        switch (cultivo.estado) {

            case "Sembrado":
                sembrados++;
                break;

            case "En crecimiento":
                enCrecimiento++;
                break;

            case "Cosechado":
                cosechados++;
                break;
        }

    });

    document.getElementById("statSembrados").innerText = sembrados;
    document.getElementById("statCrecimiento").innerText = enCrecimiento;
    document.getElementById("statCosechados").innerText = cosechados;
    document.getElementById("statTotal").innerText = cultivosTotales;
}

async function cargarCultivos(uid, estado = null) {

    tablaCultivos.innerHTML = "";

    let consulta;

    if (estado == null) {

        consulta = query(
            collection(db, "cultivos"),
            where("uid", "==", uid)
        );

    } else {

        consulta = query(
            collection(db, "cultivos"),
            where("uid", "==", uid),
            where("estado", "==", estado)
        );

    }

    const snapshot = await getDocs(consulta);

    if (snapshot.empty) {
        estadoVacio.classList.remove("d-none");
        return;
    }

    estadoVacio.classList.add("d-none");

    snapshot.forEach((doc) => {

        const cultivo = doc.data();
        const cultivoId = doc.id;

        tablaCultivos.innerHTML += `
            <tr>
                <td>${cultivo.tipo}</td>
                <td>${cultivo.fecha}</td>
                <td>${cultivo.area}</td>
                <td>${cultivo.estado}</td>
                <td>${cultivo.observaciones}</td>

                <td class="text-end">
                    <button
                        class="btneditar btn btn-warning btn-sm"
                        data-id="${cultivoId}"
                        data-bs-toggle="modal"
                        data-bs-target="#modalCultivo">
                        Editar
                    </button>

                    <button
                        class="btneliminar btn btn-danger btn-sm"
                        data-id="${cultivoId}">
                        Eliminar
                    </button>
                </td>
            </tr>
        `;

    });

}

//filtros




filtroEstado.addEventListener("change", () => {

    const estado = filtroEstado.value === "todos"
        ? null
        : filtroEstado.value;

    cargarCultivos(auth.currentUser.uid, estado);

});





tablaCultivos.addEventListener("click", async (e) => {

    // ===========================
    // EDITAR
    // ===========================
    if (e.target.classList.contains("btneditar")) {

        cultivoEditando = e.target.dataset.id;

        const docRef = doc(db, "cultivos", cultivoEditando);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {

            const cultivo = docSnap.data();

            tipoCultivo.value = cultivo.tipo;
            fechaSiembra.value = cultivo.fecha;
            areaCultivo.value = cultivo.area;
            estadoCultivo.value = cultivo.estado;
            observacionesCultivo.value = cultivo.observaciones;
        }
    }

    // ===========================
    // ELIMINAR
    // ===========================
    if (e.target.classList.contains("btneliminar")) {

        const resultado = await Swal.fire({
            title: "¿Eliminar cultivo?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });

        if (!resultado.isConfirmed) return;

        const cultivoId = e.target.dataset.id;
        Swal.fire({
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        await deleteDoc(doc(db, "cultivos", cultivoId));

        await cargarEstadisticas(auth.currentUser.uid);
        filtroEstado.value = "todos";
        await cargarCultivos(auth.currentUser.uid);

        Swal.fire({
            icon: "success",
            title: "Cultivo eliminado correctamente"
        });
    }

});



//-------------------Escuchar cambios en la autenticación-------------------
estadoAutenticacion(async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    await cargarEstadisticas(user.uid);
    filtroEstado.value = "todos";
    await cargarCultivos(auth.currentUser.uid);

});

//-------------------Escuchar el envío del formulario de cultivo-------------------

formCultivo.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (cultivoEditando == null) {

        try {
            Swal.fire({
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            await addDoc(collection(db, "cultivos"), {

                uid: user.uid,

                tipo: tipoCultivo.value,

                fecha: fechaSiembra.value,

                area: Number(areaCultivo.value),

                estado: estadoCultivo.value,

                observaciones: observacionesCultivo.value

            });

            await cargarEstadisticas(user.uid);
            filtroEstado.value = "todos";
            await cargarCultivos(auth.currentUser.uid);
            modal.hide();
            formCultivo.reset();
            Swal.fire({
                icon: "success",
                title: "Cultivo registrado",
                text: "El cultivo se guardó correctamente.",
                confirmButtonColor: "#4CAF50"
            });
            cultivoEditando = null;
        } catch (error) {

            console.log(error);

        }
    } else {
        Swal.fire({
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        await updateDoc(doc(db, "cultivos", cultivoEditando), {

            tipo: tipoCultivo.value,
            fecha: fechaSiembra.value,
            area: Number(areaCultivo.value),
            estado: estadoCultivo.value,
            observaciones: observacionesCultivo.value

        });

        await cargarEstadisticas(user.uid);
        filtroEstado.value = "todos";
        await cargarCultivos(auth.currentUser.uid);
        formCultivo.reset();
        Swal.fire({
            icon: "success",
            title: "Cultivo actualizado"
        });
        cultivoEditando = null;

    }

});


const modalCultivo = document.getElementById("modalCultivo");
modalCultivo.addEventListener("hidden.bs.modal", () => {
    formCultivo.reset();
    cultivoEditando = null;
});

//cerrar sesion

const botoncerrarsesion = document.getElementById("btnLogout")
botoncerrarsesion.addEventListener("click", async () => {

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