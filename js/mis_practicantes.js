import { db, auth } from './firebase-config.js';
import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const contenedor = document.getElementById('lista-practicantes');
const emailUser = document.getElementById('user-email');
const logoutBtn = document.getElementById('btn-logout');

/* 🔐 AUTH */
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        // 🔥 CORRECCIÓN CLAVE
        window.location.href = "../index.html";
        return;
    }

    emailUser.textContent = user.email;

    const q = query(
        collection(db, "usuarios"),
        where("rol", "==", "practicante"),
        where("liderId", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    contenedor.innerHTML = "";

    if (snapshot.empty) {
        contenedor.innerHTML = `
            <p class="loading">No tienes practicantes asignados aún 🫠</p>
        `;
        return;
    }

    snapshot.forEach((doc) => {
        const p = doc.data();

        const div = document.createElement('div');
        div.className = 'card-practicante';

        div.innerHTML = `
            <div class="header-p" onclick="toggleTareas('${doc.id}')">
                <strong>👤 ${p.nombre}</strong>
                <span id="badge-${doc.id}" class="badge">Ver tareas</span>
            </div>

            <div id="tareas-${doc.id}" class="tareas-container" style="display:none;"></div>
        `;

        contenedor.appendChild(div);
    });
});

/* 🚪 LOGOUT */
logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = "../index.html";
});

/* 📌 TOGGLE TAREAS */
window.toggleTareas = async (practicanteId) => {

    const contenedorTareas = document.getElementById(`tareas-${practicanteId}`);
    const badge = document.getElementById(`badge-${practicanteId}`);

    if (contenedorTareas.style.display === 'block') {
        contenedorTareas.style.display = 'none';
        return;
    }

    contenedorTareas.style.display = 'block';
    contenedorTareas.innerHTML = "Cargando...";

    const q = query(
        collection(db, "tareas"),
        where("practicanteId", "==", practicanteId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        contenedorTareas.innerHTML = "<p>No hay tareas asignadas.</p>";
        badge.textContent = "0 tareas";
        return;
    }

    badge.textContent = `${snapshot.size} tareas`;

    contenedorTareas.innerHTML = snapshot.docs.map(t => {
        const data = t.data();

        return `
            <div class="tarea-item">
                <div class="tarea-header" onclick="toggleDescripcion('${t.id}')">
                    <i class='bx bx-chevron-right'></i>
                    ${data.titulo}
                </div>

                <div id="desc-${t.id}" class="tarea-desc" style="display:none;">
                    <p>${data.descripcion}</p>
                    <small>📅 ${new Date(data.fechaCreacion).toLocaleDateString()}</small>
                </div>
            </div>
        `;
    }).join('');
};

/* 📄 DESCRIPCIÓN */
window.toggleDescripcion = (taskId) => {
    const el = document.getElementById(`desc-${taskId}`);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
};