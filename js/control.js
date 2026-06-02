import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { db, auth } from "../js/firebase-config.js";

let tareaActual = null;

/* AUTH */
onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "../html/login.html";
        return;
    }

    document.getElementById("user-email").textContent = user.email;

    cargar(user.uid);

});

/* CARGAR */
async function cargar(uid){

    const contenedor = document.getElementById("lista-control");

    const q = query(collection(db,"tareas"),where("practicanteId","==",uid));

    const snap = await getDocs(q);

    contenedor.innerHTML = "";

    snap.forEach((d)=>{

        const t = d.data();

        const div = document.createElement("div");
        div.className = `card ${t.completada ? "done":""}`;

        div.innerHTML = `
            <div>
                <h3>${t.titulo}</h3>
                <small>${t.completada ? "Completado":"Pendiente"}</small>
            </div>

            <button class="btn ${t.completada ? "btn-red":"btn-blue"}">
                ${t.completada ? "Deshacer":"Completar"}
            </button>
        `;

        const btn = div.querySelector("button");

        btn.onclick = () => {

            if(t.completada){
                revertir(d.id);
            }else{
                tareaActual = d.id;
                abrirModal();
            }

        };

        contenedor.appendChild(div);

    });

}

/* MODAL */
function abrirModal(){
    document.getElementById("modal").style.display="flex";
}

document.getElementById("cancelar").onclick = () =>{
    document.getElementById("modal").style.display="none";
};

/* GUARDAR CONOCIMIENTO */
document.getElementById("guardar").onclick = async () => {

    const comentario = document.getElementById("comentario").value;
    const pasos = document.getElementById("pasos").value;
    const mejora = document.getElementById("mejora").value;
    const dificultad = document.getElementById("dificultad").value;

    if(!comentario || !pasos || !mejora || !dificultad){
        alert("Completa todos los campos");
        return;
    }

    /* actualizar tarea */
    await updateDoc(doc(db,"tareas",tareaActual),{
        completada:true
    });

    /* guardar en biblioteca */
    await addDoc(collection(db,"biblioteca_conocimientos"),{
        tareaId:tareaActual,
        comentario,
        pasos,
        mejora,
        dificultad,
        fecha:serverTimestamp()
    });

    document.getElementById("modal").style.display="none";

    location.reload();

};

/* REVERTIR */
async function revertir(id){
    await updateDoc(doc(db,"tareas",id),{
        completada:false
    });

    location.reload();
}