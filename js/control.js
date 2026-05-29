import { db, auth } from '../js/firebase-config.js';
import { collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) return window.location.href = "../html/login.html";

    // Cargar email en el header
    const emailEl = document.getElementById('user-email');
    if(emailEl) emailEl.textContent = user.email;

    const contenedor = document.getElementById('lista-control');
    const q = query(collection(db, "tareas"), where("practicanteId", "==", user.uid));
    const snapshot = await getDocs(q);

    contenedor.innerHTML = "";
    if (snapshot.empty) {
        contenedor.innerHTML = `<p style="text-align:center; color:#94a3b8;">No tienes tareas asignadas.</p>`;
        return;
    }

    snapshot.forEach((docSnap) => {
        const t = docSnap.data();
        const div = document.createElement('div');
        div.className = `card-control ${t.completada ? 'completada' : ''}`;
        div.innerHTML = `
            <div class="tarea-info">
                <h3 style="margin:0 0 8px 0;">${t.titulo}</h3>
                <span style="font-size: 0.85rem; color: ${t.completada ? '#059669' : '#64748b'}">
                    ${t.completada ? '● Completado' : '○ Pendiente'}
                </span>
            </div>
            <button class="btn-check ${t.completada ? 'btn-deshacer' : 'btn-marcar'}" 
                    data-id="${docSnap.id}" 
                    data-estado="${!t.completada}">
                ${t.completada ? 'Deshacer' : 'Completar Tarea'}
            </button>
        `;
        contenedor.appendChild(div);
    });

    // Eventos de botones
    document.querySelectorAll('.btn-check').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            const nuevoEstado = e.target.getAttribute('data-estado') === 'true';
            
            e.target.innerText = "Actualizando...";
            await updateDoc(doc(db, "tareas", id), { completada: nuevoEstado });
            location.reload(); 
        });
    });
});