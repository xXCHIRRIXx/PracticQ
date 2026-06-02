import { db, auth } from "./firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    orderBy
}
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    document.getElementById("user-email").textContent = user.email;

    const contenedor =
        document.getElementById("lista-tareas-lider");

    try {

        const tareasQuery = query(
            collection(db, "tareas"),
            orderBy("fechaCreacion", "desc")
        );

        const snapshot =
            await getDocs(tareasQuery);

        document.getElementById("total-tareas").textContent =
            snapshot.size;

        if (snapshot.empty) {

            contenedor.innerHTML = `
                <div class="loader-container">
                    <i class='bx bx-coffee'></i>
                    <p>No hay tareas registradas.</p>
                </div>
            `;

            return;
        }

        contenedor.innerHTML = "";

        let delay = 0;

        for (const tareaDoc of snapshot.docs) {

            const t = tareaDoc.data();

            const completada =
                t.completada === true;

            let nombrePracticante =
                "Practicante";

            try {

                if (
                    t.practicanteId &&
                    t.practicanteId !== ""
                ) {

                    const usuarioRef =
                        doc(
                            db,
                            "usuarios",
                            t.practicanteId
                        );

                    const usuarioSnap =
                        await getDoc(usuarioRef);

                    if (usuarioSnap.exists()) {

                        nombrePracticante =
                            usuarioSnap.data().nombre ||
                            "Sin nombre";
                    }
                }

            } catch (error) {

                console.error(
                    "Error obteniendo practicante:",
                    error
                );

            }

            let fechaCreacion =
                "Sin fecha";

            try {

                if (t.fechaCreacion) {

                    const fechaObj =
                        t.fechaCreacion.toDate
                            ? t.fechaCreacion.toDate()
                            : new Date(
                                t.fechaCreacion
                            );

                    fechaCreacion =
                        fechaObj.toLocaleDateString(
                            "es-CO"
                        );
                }

            } catch (error) {
                console.log(error);
            }

            let fechaLimite = "";

            try {

                if (t.fechaLimite) {

                    const fechaObj =
                        t.fechaLimite.toDate
                            ? t.fechaLimite.toDate()
                            : new Date(
                                t.fechaLimite
                            );

                    fechaLimite =
                        fechaObj.toLocaleDateString(
                            "es-CO"
                        );
                }

            } catch (error) {
                console.log(error);
            }

            const card =
                document.createElement("div");

            card.className =
                `card-task ${
                    completada
                    ? "done"
                    : "pending"
                }`;

            card.innerHTML = `
                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-start;
                    gap:10px;
                ">

                    <span class="task-badge">
                        ${
                            completada
                            ? "Completada"
                            : "Pendiente"
                        }
                    </span>

                    <span>
                        ${
                            fechaLimite
                            ? `Vence: ${fechaLimite}`
                            : ""
                        }
                    </span>

                </div>

                <h3>
                    ${t.titulo || "Sin título"}
                </h3>

                <p>
                    ${t.descripcion || "Sin descripción"}
                </p>

                <div class="task-footer">

                    <div class="practicante-info">
                        <i class='bx bx-user-circle'></i>
                        <span>
                            ${nombrePracticante}
                        </span>
                    </div>

                    <div>
                        <i class='bx bx-calendar'></i>
                        ${fechaCreacion}
                    </div>

                </div>
            `;

            card.style.opacity = "0";
            card.style.transform =
                "translateY(20px)";

            setTimeout(() => {

                card.style.transition =
                    ".4s ease";

                card.style.opacity = "1";

                card.style.transform =
                    "translateY(0)";

            }, delay);

            delay += 80;

            contenedor.appendChild(card);
        }

    } catch (error) {

        console.error(
            "Error cargando tareas:",
            error
        );

        contenedor.innerHTML = `
            <div class="loader-container">
                <i class='bx bx-error-circle'></i>
                <p>
                    Error al cargar tareas.
                </p>
            </div>
        `;
    }

});