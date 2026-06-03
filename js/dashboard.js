// js/dashboard.js
import { db, auth } from "./firebase-config.js"; 
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

let miGrafico = null;

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuario autenticado:", user.email);
            
            // 1. Obtener datos del usuario en la colección 'usuarios'
            // NOTA: Asegúrate de que el campo en tu BD sea 'correo'
            const userQuery = query(collection(db, "usuarios"), where("correo", "==", user.email));
            const userSnapshot = await getDocs(userQuery);
            
            let userData = { rol: "practicante", id: "" };
            if (!userSnapshot.empty) {
                const doc = userSnapshot.docs[0];
                userData = doc.data();
                userData.id = doc.id; // Asignamos el ID del documento
                console.log("Datos del usuario cargados:", userData);
            }

            cargarDatosReales(userData);
        } else {
            console.warn("Usuario no autenticado, redirigiendo...");
            window.location.href = "../html/login.html";
        }
    });
});

async function cargarDatosReales(userData) {
    try {
        const tareasRef = collection(db, "tareas");
        let q;

        // 2. Filtro: Si es admin, ve todo. Si no, filtra por su id.
        if (userData.rol === "admin" || userData.rol === "administrador") {
            q = query(tareasRef);
        } else {
            // Revisa si el campo en Firebase se llama 'liderId' o 'lider'
            q = query(tareasRef, where("liderId", "==", userData.id));
        }

        const querySnapshot = await getDocs(q);
        console.log("Total de tareas encontradas:", querySnapshot.size);

        const tareasReales = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("Mapeando tarea:", data); 

            tareasReales.push({
                titulo: data.titulo || "Sin Título",
                progreso: data.completada ? 100 : 0,
                dificultad: data.dificultad || 3,
                comentarios: data.descripcion || "Sin descripción",
                completada: !!data.completada // Forzar a booleano
            });
        });

        render(tareasReales);
    } catch (error) {
        console.error("Error crítico al cargar desde Firestore:", error);
    }
}

function render(data) {
    const tbody = document.getElementById("tabla-body");
    if (!tbody) return;
    
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No hay tareas registradas.</td></tr>`;
        return;
    }

    let comp = 0;
    let pen = 0;

    data.forEach(t => {
        if (t.completada) comp++;
        else pen++;

        tbody.innerHTML += `
            <tr>
                <td>${t.titulo}</td>
                <td>${t.progreso}%</td>
                <td>${t.dificultad}</td>
                <td>${t.comentarios}</td>
            </tr>
        `;
    });

    // 3. Cálculo de KPIs
    const total = data.length;
    const porcentajeCompletado = total > 0 ? Math.round((comp / total) * 100) : 0;

    document.getElementById("kpi-tareas").innerText = total;
    document.getElementById("kpi-completadas").innerText = porcentajeCompletado + "%";
    document.getElementById("kpi-pendientes").innerText = pen;
    document.getElementById("kpi-progreso").innerText = porcentajeCompletado + "%";
    document.getElementById("chart-percent").innerText = porcentajeCompletado + "%";

    // 4. Gráfico
    if (miGrafico) miGrafico.destroy();
    const ctx = document.getElementById("chart-progreso");
    if (ctx) {
        miGrafico = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["Completadas", "Pendientes"],
                datasets: [{
                    data: [comp, pen],
                    backgroundColor: ["#10B981", "#EF4444"]
                }]
            },
            options: { plugins: { legend: { display: false } } }
        });
    }
}