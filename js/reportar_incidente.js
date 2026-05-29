import { db, auth } from '../js/firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// 1. Verificación de sesión más robusta
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "../index.html";
        return;
    }
    const emailEl = document.getElementById('user-email');
    if (emailEl) emailEl.textContent = user.email;
});

// 2. Manejo del formulario
document.getElementById('form-incidente').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = e.target.querySelector('button');
    btn.textContent = "Enviando...";
    btn.disabled = true;

    // Captura de valores
    const titulo = document.getElementById('titulo').value;
    const asunto = document.getElementById('asunto').value;
    const descripcion = document.getElementById('descripcion').value;

    try {
        // Aseguramos que tenemos un usuario logueado
        if (!auth.currentUser) throw new Error("No hay usuario autenticado.");

        // 3. Ejecución y captura del documento creado
        const docRef = await addDoc(collection(db, "incidentes"), {
            titulo: titulo,
            asunto: asunto,
            descripcion: descripcion,
            practicanteId: auth.currentUser.uid,
            fecha: new Date().toISOString(),
            leido: false
        });

        console.log("Documento guardado con ID: ", docRef.id);
        
        // Confirmación visual
        alert("¡Reporte enviado exitosamente!");
        window.location.href = "practicante.html";

    } catch (error) {
        console.error("DETALLE DEL ERROR:", error);
        alert("Error al enviar: " + error.message);
        
        // Restaurar botón
        btn.textContent = "Enviar Reporte";
        btn.disabled = false;
    }
});