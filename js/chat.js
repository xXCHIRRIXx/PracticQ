import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, setDoc, getDocs, where } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";

// --- CONFIGURACIÓN ---
const firebaseConfig = {
    apiKey: "AIzaSyBbP0hAPME4jWMBKMalwIvkvtYtzh6QWPA",
    authDomain: "practiq-1c148.firebaseapp.com",
    databaseURL: "https://practiq-1c148-default-rtdb.firebaseio.com",
    projectId: "practiq-1c148",
    storageBucket: "practiq-1c148.firebasestorage.app",
    messagingSenderId: "948871542587",
    appId: "1:948871542587:web:602b6c78f46201bc74291e",
    measurementId: "G-Q8Q50FHW6F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

let usuarioActual = null;
let chatIdActual = null;

// --- 1. LOGIN & USUARIO ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "usuarios", user.uid));
            const data = userDoc.exists() ? userDoc.data() : { rol: 'practicante', nombre: 'Usuario', liderId: '' };
            usuarioActual = { uid: user.uid, email: user.email, ...data };
            console.log("Usuario autenticado correctamente:", usuarioActual);
            cargarContactos();
        } catch (e) {
            console.error("Error al cargar perfil de usuario:", e);
        }
    } else {
        window.location.href = '../html/index.html';
    }
});

// --- 2. CARGAR CONTACTOS ---
async function cargarContactos() {
    const lista = document.getElementById('lista-contactos');
    if (!lista) return;
    lista.innerHTML = "";
    
    try {
        let docs = [];
        if (usuarioActual.rol === 'practicante' && usuarioActual.liderId) {
            const l = await getDoc(doc(db, "usuarios", usuarioActual.liderId));
            if (l.exists()) docs.push(l);
        } else if (usuarioActual.rol === 'lider') {
            const q = query(collection(db, "usuarios"), where("liderId", "==", usuarioActual.uid));
            docs = (await getDocs(q)).docs;
        } else if (usuarioActual.rol === 'admin') {
            docs = (await getDocs(collection(db, "usuarios"))).docs;
        }
        
        docs.forEach(d => {
            if (d.id !== usuarioActual.uid) renderContacto(d.id, d.data().nombre);
        });
    } catch (e) { console.error("Error al cargar contactos:", e); }
}

function renderContacto(uid, nombre) {
    const div = document.createElement('div');
    div.className = "contacto-item";
    div.textContent = nombre;
    div.onclick = () => {
        // Ordenamos los IDs para que el nombre del documento sea consistente
        const uids = [usuarioActual.uid, uid].sort();
        chatIdActual = uids.join('_');
        document.getElementById('chat-title').innerText = `Chat con ${nombre}`;
        iniciarChat(chatIdActual, uids);
    };
    document.getElementById('lista-contactos').appendChild(div);
}

// --- 3. INICIAR CHAT ---
async function iniciarChat(chatId, arrayParticipantes) {
    const chatRef = doc(db, "chats", chatId);
    const snap = await getDoc(chatRef);
    
    if (!snap.exists()) {
        await setDoc(chatRef, { 
            participantes: arrayParticipantes, 
            ultimaActualizacion: serverTimestamp() 
        });
    }
    
    // Escuchar mensajes
    const container = document.getElementById('mensajes-container');
    const q = query(collection(db, "chats", chatId, "mensajes"), orderBy("timestamp", "asc"));
    
    onSnapshot(q, (snapshot) => {
        container.innerHTML = "";
        snapshot.forEach(doc => {
            const d = doc.data();
            const div = document.createElement('div');
            div.className = d.emisor === usuarioActual.uid ? 'mensaje emisor' : 'mensaje receptor';
            div.textContent = d.texto;
            container.appendChild(div);
        });
        container.scrollTop = container.scrollHeight;
    });
}

// --- 4. ENVÍO ---
document.getElementById('form-enviar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('input-mensaje');
    if (!chatIdActual || input.value.trim() === "") return;

    try {
        await addDoc(collection(db, "chats", chatIdActual, "mensajes"), {
            texto: input.value,
            emisor: usuarioActual.uid,
            timestamp: serverTimestamp()
        });
        input.value = "";
    } catch (e) {
        console.error("Error al guardar mensaje:", e);
        alert("Error de permisos: no se pudo enviar el mensaje.");
    }
});