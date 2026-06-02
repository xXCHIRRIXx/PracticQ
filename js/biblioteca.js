import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { db } from "../js/firebase-config.js";

let dataGlobal = [];

/* CARGAR DATA */
async function cargar(){

    const q = query(
        collection(db,"biblioteca_conocimientos"),
        orderBy("fecha","desc")
    );

    const snap = await getDocs(q);

    dataGlobal = [];

    snap.forEach(doc=>{

        dataGlobal.push({
            id:doc.id,
            ...doc.data()
        });

    });

    render(dataGlobal);

}

function render(data){

    const cont = document.getElementById("lista");

    cont.innerHTML = "";

    data.forEach(item=>{

        cont.innerHTML += `
            <div class="card">

                <h3>${item.comentario || "Sin título"}</h3>

                <div class="meta">
                    🧠 ${item.pasos || ""}<br>
                    🔧 ${item.mejora || ""}<br>
                </div>

                <span class="badge ${getClass(item.dificultad)}">
                    Dificultad ${item.dificultad}
                </span>

            </div>
        `;

    });

}

function getClass(d){
    if(d <= 2) return "easy";
    if(d <= 4) return "medium";
    return "hard";
}

/* SEARCH */
document.getElementById("search").addEventListener("input",(e)=>{

    const val = e.target.value.toLowerCase();

    const filtered = dataGlobal.filter(item=>
        (item.comentario || "").toLowerCase().includes(val) ||
        (item.pasos || "").toLowerCase().includes(val)
    );

    render(filtered);

});

/* FILTER */
document.querySelectorAll(".filters button").forEach(btn=>{

    btn.addEventListener("click",()=>{

        const f = btn.dataset.filter;

        if(f === "all"){
            render(dataGlobal);
        }else{
            render(dataGlobal.filter(i => i.dificultad == f));
        }

    });

});

cargar();