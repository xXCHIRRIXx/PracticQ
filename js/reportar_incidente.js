import { db, auth } from '../js/firebase-config.js';
import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const form = document.getElementById('form-incidente');
const btn = document.getElementById('btn-submit');
const emailEl = document.getElementById('user-email');

let currentUser = null;

/* 🔐 AUTH */
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    currentUser = user;
    emailEl.textContent = user.email;
});

/* 📩 SUBMIT */
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) return;

    const titulo = document.getElementById('titulo').value.trim();
    const asunto = document.getElementById('asunto').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();

    btn.disabled = true;
    btn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Enviando...`;

    try {
        await addDoc(collection(db, "incidentes"), {
            titulo,
            asunto,
            descripcion,
            practicanteId: currentUser.uid,
            fecha: new Date().toISOString(),
            leido: false
        });

        alert("Incidente enviado con éxito 🚀");

        window.location.href = "../html/practicante.html";

    } catch (err) {
        console.error(err);
        alert("Error al enviar el incidente");

        btn.disabled = false;
        btn.innerHTML = `<i class='bx bx-send'></i> Enviar reporte`;
    }
});