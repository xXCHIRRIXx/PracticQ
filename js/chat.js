import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    collection,
    addDoc,
    query,
    onSnapshot,
    orderBy,
    serverTimestamp,
    setDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {
    apiKey: "AIzaSyBbP0hAPME4jWMBKMalwIvkvtYtzh6QWPA",
    authDomain: "practiq-1c148.firebaseapp.com",
    projectId: "practiq-1c148",
    storageBucket: "practiq-1c148.firebasestorage.app",
    messagingSenderId: "948871542587",
    appId: "1:948871542587:web:602b6c78f46201bc74291e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =========================
   STATE
========================= */

let usuarioActual = null;
let chatIdActual = null;

/* =========================
   AUTH GUARD
========================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "../login.html";
        return;
    }

    try {

        const userDoc =
            await getDoc(doc(db, "usuarios", user.uid));

        usuarioActual = {
            uid: user.uid,
            email: user.email,
            ...(userDoc.exists() ? userDoc.data() : {})
        };

        cargarContactos();

    } catch (err) {

        console.error(err);

        window.location.href = "../login.html";

    }

});

/* =========================
   BOTÓN VOLVER AL PANEL
========================= */

document.getElementById("btn-volver").addEventListener("click", () => {

    const rol = usuarioActual?.rol;

    if (rol === "admin") {
        window.location.href = "../html/admin.html";
    }

    else if (rol === "lider") {
        window.location.href = "../html/lider.html";
    }

    else {
        window.location.href = "../html/practicante.html";
    }

});

/* =========================
   CONTACTOS
========================= */

async function cargarContactos() {

    const lista =
        document.getElementById("lista-contactos");

    lista.innerHTML = "";

    const snapshot =
        await getDocs(collection(db, "usuarios"));

    snapshot.forEach((docu) => {

        if (docu.id !== usuarioActual.uid) {

            const div = document.createElement("div");

            div.className = "contacto-item";

            div.textContent = docu.data().nombre;

            div.addEventListener("click", () => {

                iniciarChat(docu.id, docu.data().nombre);

            });

            lista.appendChild(div);

        }

    });

}

/* =========================
   INICIAR CHAT
========================= */

async function iniciarChat(uid, nombre) {

    const ids = [usuarioActual.uid, uid].sort();

    chatIdActual = ids.join("_");

    document.getElementById("chat-title").textContent =
        `Chat con ${nombre}`;

    const chatRef =
        doc(db, "chats", chatIdActual);

    const snap =
        await getDoc(chatRef);

    if (!snap.exists()) {

        await setDoc(chatRef, {
            participantes: ids
        });

    }

    const container =
        document.getElementById("mensajes-container");

    const q = query(
        collection(db, "chats", chatIdActual, "mensajes"),
        orderBy("timestamp", "asc")
    );

    onSnapshot(q, (snapshot) => {

        container.innerHTML = "";

        snapshot.forEach((msg) => {

            const data = msg.data();

            const div = document.createElement("div");

            div.className =
                data.emisor === usuarioActual.uid
                    ? "mensaje emisor"
                    : "mensaje receptor";

            div.textContent = data.texto;

            container.appendChild(div);

        });

        container.scrollTop = container.scrollHeight;

    });

}

/* =========================
   ENVIAR MENSAJE
========================= */

document.getElementById("form-enviar")
.addEventListener("submit", async (e) => {

    e.preventDefault();

    const input =
        document.getElementById("input-mensaje");

    const texto =
        input.value.trim();

    if (!chatIdActual || texto === "") return;

    await addDoc(
        collection(db, "chats", chatIdActual, "mensajes"),
        {
            texto,
            emisor: usuarioActual.uid,
            timestamp: serverTimestamp()
        }
    );

    input.value = "";

});