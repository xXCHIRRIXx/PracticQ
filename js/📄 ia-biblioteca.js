import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { db } from "../js/firebase-config.js";

let conocimientos = [];

/* =========================
   CARGAR BASE DE CONOCIMIENTO
========================= */

async function cargarBase(){

    const snap = await getDocs(collection(db,"biblioteca_conocimientos"));

    conocimientos = [];

    snap.forEach(doc=>{
        conocimientos.push({
            id:doc.id,
            ...doc.data()
        });
    });

    console.log("🧠 Base cargada:", conocimientos.length);

}

cargarBase();

/* =========================
   IA SIMPLE (QUERY INTELIGENTE)
========================= */

export function buscarIA(pregunta){

    const q = pregunta.toLowerCase();

    const resultados = conocimientos.filter(item=>{

        return (
            (item.comentario || "").toLowerCase().includes(q) ||
            (item.pasos || "").toLowerCase().includes(q) ||
            (item.mejora || "").toLowerCase().includes(q)
        );

    });

    return generarRespuesta(resultados, pregunta);

}

/* =========================
   MOTOR DE RESPUESTA
========================= */

function generarRespuesta(resultados, pregunta){

    if(resultados.length === 0){
        return {
            respuesta: "No encontré información en la biblioteca para eso.",
            fuentes: []
        };
    }

    // ordenar por dificultad (más útiles primero)
    resultados.sort((a,b)=>b.dificultad - a.dificultad);

    const resumen = resultados.slice(0,3).map(r => {

        return `🧠 ${r.comentario}
🔧 Pasos: ${r.pasos}
⚡ Mejora: ${r.mejora}
📊 Dificultad: ${r.dificultad}/5`;

    }).join("\n\n---\n\n");

    return {
        respuesta: `Encontré estos conocimientos relacionados con: "${pregunta}"\n\n${resumen}`,
        fuentes: resultados
    };

}