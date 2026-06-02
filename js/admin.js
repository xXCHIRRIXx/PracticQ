import { auth, db } from './firebase-config.js';

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
    collection,
    getDocs,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    const modal =
        document.getElementById('modal-asignacion');

    const btnAsignar =
        document.getElementById('card-asignar-admin');

    const btnClose =
        document.querySelector('.close-modal');

    const btnLogout =
        document.getElementById('btn-logout');

    const emailEl =
        document.getElementById('user-email');

    // ==========================
    // AUTH GUARD
    // ==========================

    onAuthStateChanged(auth, (user) => {

        if (!user) {

            window.location.href =
                "../index.html";

            return;

        }

        if (emailEl) {
            emailEl.textContent = user.email;
        }

    });

    // ==========================
    // LOGOUT
    // ==========================

    if (btnLogout) {

        btnLogout.addEventListener('click', async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "../index.html";

            } catch (error) {

                console.error(error);

                showToast(
                    "Error al cerrar sesión",
                    "#EF4444"
                );

            }

        });

    }

    // ==========================
    // OPEN MODAL
    // ==========================

    if (btnAsignar) {

        btnAsignar.addEventListener('click', async () => {

            modal.style.display = "block";

            await cargarUsuarios();

        });

    }

    // ==========================
    // CLOSE MODAL
    // ==========================

    if (btnClose) {

        btnClose.addEventListener('click', () => {
            modal.style.display = "none";
        });

    }

    window.addEventListener('click', (e) => {

        if (e.target === modal) {
            modal.style.display = "none";
        }

    });

    // ==========================
    // LOAD USERS
    // ==========================

    async function cargarUsuarios() {

        try {

            const snapshot =
                await getDocs(
                    collection(db, "usuarios")
                );

            const practicantes = [];
            const lideres = [];

            snapshot.forEach((docSnap) => {

                const data =
                    docSnap.data();

                if (data.rol === 'practicante') {
                    practicantes.push({
                        id: docSnap.id,
                        ...data
                    });
                }

                if (data.rol === 'lider') {
                    lideres.push({
                        id: docSnap.id,
                        ...data
                    });
                }

            });

            renderTabla(practicantes, lideres);

        } catch (error) {

            console.error(error);

            showToast(
                "Error cargando usuarios",
                "#EF4444"
            );

        }

    }

    // ==========================
    // RENDER TABLE
    // ==========================

    function renderTabla(practicantes, lideres) {

        const tbody =
            document.getElementById('lista-asignaciones');

        if (!tbody) return;

        tbody.innerHTML = practicantes.map(p => {

            return `
                <tr>

                    <td>
                        <strong>${p.nombre}</strong><br>
                        <small>${p.correo}</small>
                    </td>

                    <td>
                        <select id="select-${p.id}">
                            <option value="">
                                Seleccionar líder...
                            </option>

                            ${lideres.map(l => `
                                <option value="${l.id}"
                                    ${p.liderId === l.id ? 'selected' : ''}
                                >
                                    ${l.nombre}
                                </option>
                            `).join('')}

                        </select>
                    </td>

                    <td>
                        <button
                            class="btn-save"
                            onclick="guardarAsignacion('${p.id}')"
                        >
                            Guardar
                        </button>
                    </td>

                </tr>
            `;

        }).join('');

    }

    // ==========================
    // GLOBAL SAVE FUNCTION
    // ==========================

    window.guardarAsignacion = async (practicanteId) => {

        const select =
            document.getElementById(
                `select-${practicanteId}`
            );

        const liderId =
            select.value;

        if (!liderId) {

            showToast(
                "Selecciona un líder",
                "#F59E0B"
            );

            return;

        }

        try {

            await updateDoc(
                doc(db, "usuarios", practicanteId),
                { liderId }
            );

            showToast(
                "Asignación guardada",
                "#22C55E"
            );

        } catch (error) {

            console.error(error);

            showToast(
                "Error al guardar",
                "#EF4444"
            );

        }

    };

    // ==========================
    // TOAST NOTIFICATIONS
    // ==========================

    function showToast(message, color = "#22C55E") {

        const toast =
            document.createElement('div');

        toast.textContent = message;

        toast.style.position = "fixed";
        toast.style.bottom = "20px";
        toast.style.right = "20px";

        toast.style.background = color;

        toast.style.color = "#0B1220";

        toast.style.padding = "12px 16px";

        toast.style.borderRadius = "12px";

        toast.style.fontWeight = "600";

        toast.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.3)";

        toast.style.zIndex = "9999";

        toast.style.transition = ".3s";

        toast.style.opacity = "0";

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "1";
        }, 50);

        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 300);
        }, 2500);

    }

});