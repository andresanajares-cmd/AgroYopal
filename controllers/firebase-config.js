//importar librerias de firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

//proyecto de firebase
const firebaseConfig = {
  apiKey: "AIzaSyAa_hKsRPSyxyWQbbMyyhFtiGviPc75ncA",
  authDomain: "agroyopal-c55e5.firebaseapp.com",
  projectId: "agroyopal-c55e5",
  storageBucket: "agroyopal-c55e5.firebasestorage.app",
  messagingSenderId: "447656349442",
  appId: "1:447656349442:web:e94cc65121349ba1227c1b"
};



//inicializar firebase
const app = initializeApp(firebaseConfig);
//obtener autenticacion
const auth = getAuth(app);
//obtener firestore
const db = getFirestore(app);
//exportar autenticacion y firestore, para usarlos posteriormente en otros archivos
export { auth, db };