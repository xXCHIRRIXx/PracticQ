import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { db } from "../js/firebase-config.js";

/* =========================
   MEMORIA LOCAL (CONTEXTO)
========================= */

let memoriaChat = [];

/* =========================
   CARGAR CONOCIMIENTO
========================= */

let base = [];

async function cargarBase(){

    const snap = await getDocs(collection(db,"biblioteca_conocimientos"));

    base = [];

    snap.forEach(d=>{
        base.push({
            id:d.id,
            ...d.data()
        });
    });

    console.log("🧠 IA cargada con", base.length, "conocimientos");

}

cargarBase();

/* =========================
   MOTOR PRINCIPAL IA
========================= */

export function preguntarIA(mensaje){

    memoriaChat.push(mensaje);

    const contexto = memoriaChat.slice(-5).join(" ").toLowerCase();

    const resultados = buscarRelevantes(contexto);

    const respuesta = construirRespuesta(mensaje, resultados);

    memoriaChat.push(respuesta);

    return respuesta;

}

/* =========================
   BÚSQUEDA INTELIGENTE
========================= */

function buscarRelevantes(texto){

    const palabrasClave = extraerKeywords(texto);

    const resultados = base.filter(item=>{

        const contenido = `
            ${item.comentario}
            ${item.pasos}
            ${item.mejora}
        `.toLowerCase();

        return palabrasClave.some(k => contenido.includes(k));

    });

    return resultados.sort((a,b)=>b.dificultad - a.dificultad);

}

/* =========================
   EXTRAER INTENCIÓN
========================= */

function extraerKeywords(texto){

    const stopwords = ["como","qué","que","hice","resolver","problema","la","el","de","en","un","una"];

    return texto
        .split(" ")
        .filter(w => !stopwords.includes(w) && w.length > 2);
}

/* =========================
   GENERADOR DE RESPUESTA HUMANA
========================= */

function construirRespuesta(mensaje, resultados){

    if(resultados.length === 0){
        return {
            role:"assistant",
            content:"No encontré información exacta en la biblioteca, pero puedes intentar describir mejor el problema o agregar más contexto a tus tareas."
        };
    }

    const top = resultados.slice(0,3);

    let respuesta = `Te explico lo que encontré en base a experiencias del equipo:\n\n`;

    top.forEach((r,i)=>{

        respuesta += `
📌 Caso ${i+1}
${r.comentario}

🔧 Cómo se resolvió:
${r.pasos}

⚡ Mejora recomendada:
${r.mejora}

📊 Dificultad: ${r.dificultad}/5

---\n`;

    });

    respuesta += `💡 Consejo: intenta seguir los pasos más frecuentes y revisa las mejoras sugeridas para evitar errores repetidos.`;

    return {
        role:"assistant",
        content: respuesta,
        sources: top
    };

}