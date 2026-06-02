import { auth, db } from './firebase-config.js';

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    // ==========================
    // ELEMENTOS
    // ==========================

    const form =
        document.getElementById('register-form');

    const btnSubmit =
        document.getElementById('btn-submit');

    const message =
        document.getElementById('register-message');

    const dynamicWrapper =
        document.getElementById('dynamic-wrapper');

    const dynamicLabel =
        document.getElementById('dynamic-label');

    const dynamicInput =
        document.getElementById('dinamico');

    const roleSelector =
        document.querySelector('.role-selector');

    const passwordInput =
        document.getElementById('password');

    const togglePassword =
        document.getElementById('toggle-password');

    let adminUnlocked = false;

    // ==========================
    // TOGGLE PASSWORD
    // ==========================

    if (togglePassword) {

        togglePassword.addEventListener('click', () => {

            if (passwordInput.type === 'password') {

                passwordInput.type = 'text';
                togglePassword.textContent = '🙈';

            } else {

                passwordInput.type = 'password';
                togglePassword.textContent = '👁';

            }

        });

    }

    // ==========================
    // MENSAJES UI
    // ==========================

    function showMessage(text, color = '#EF4444') {

        message.textContent = text;
        message.style.color = color;

    }

    // ==========================
    // CAMBIO DE FORMULARIO SEGÚN ROL
    // ==========================

    function actualizarFormulario() {

        const rol =
            document.querySelector(
                'input[name="rol"]:checked'
            ).value;

        dynamicWrapper.style.opacity = '0';

        setTimeout(() => {

            switch (rol) {

                case 'practicante':

                    dynamicLabel.textContent =
                        'Enfoque (Área de práctica)';

                    dynamicInput.placeholder =
                        'Ej. Desarrollo, QA, UX/UI';

                    btnSubmit.textContent =
                        'Registrar Practicante';

                    break;

                case 'lider':

                    dynamicLabel.textContent =
                        'Cargo del Líder';

                    dynamicInput.placeholder =
                        'Ej. Scrum Master, Project Manager';

                    btnSubmit.textContent =
                        'Registrar Líder';

                    break;

                case 'admin':

                    dynamicLabel.textContent =
                        'Código Maestro';

                    dynamicInput.placeholder =
                        'Ingrese clave secreta';

                    btnSubmit.textContent =
                        'Registrar Administrador';

                    break;

            }

            dynamicWrapper.style.opacity = '1';

        }, 200);

    }

    document
        .getElementById('rol-practicante')
        .addEventListener('change', actualizarFormulario);

    document
        .getElementById('rol-lider')
        .addEventListener('change', actualizarFormulario);

    // ==========================
    // EASTER EGG ADMIN
    // ==========================

    window.addEventListener('keydown', (e) => {

        if (
            e.ctrlKey &&
            e.shiftKey &&
            e.key.toUpperCase() === 'A'
        ) {

            if (adminUnlocked) return;

            adminUnlocked = true;

            const div = document.createElement('div');

            div.innerHTML = `
                <input type="radio" id="rol-admin" name="rol" value="admin">
                <label for="rol-admin">Administrador</label>
            `;

            roleSelector.appendChild(div);

            document
                .getElementById('rol-admin')
                .addEventListener('change', actualizarFormulario);

            showMessage(
                'Modo administrador activado',
                '#14B8A6'
            );

        }

    });

    // ==========================
    // REGISTRO
    // ==========================

    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        const nombre =
            document.getElementById('nombre').value.trim();

        const correo =
            document.getElementById('correo').value.trim();

        const password =
            document.getElementById('password').value;

        const dinamico =
            document.getElementById('dinamico').value.trim();

        const rol =
            document.querySelector(
                'input[name="rol"]:checked'
            ).value;

        // ==========================
        // VALIDACIONES
        // ==========================

        if (nombre.length < 3) {

            showMessage('Nombre demasiado corto');
            return;

        }

        if (password.length < 6) {

            showMessage('La contraseña debe tener mínimo 6 caracteres');
            return;

        }

        if (!dinamico) {

            showMessage('Completa el campo adicional');
            return;

        }

        // ==========================
        // LOADING
        // ==========================

        btnSubmit.disabled = true;

        const originalText =
            btnSubmit.innerHTML;

        btnSubmit.innerHTML = `
            <span class="loader"></span>
            Creando cuenta...
        `;

        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    correo,
                    password
                );

            await setDoc(
                doc(
                    db,
                    "usuarios",
                    userCredential.user.uid
                ),
                {
                    nombre,
                    correo,
                    rol,
                    detalleRol: dinamico,
                    fechaRegistro:
                        new Date().toISOString()
                }
            );

            btnSubmit.innerHTML = '✓ Cuenta creada';
            btnSubmit.style.background = '#10B981';

            showMessage(
                'Registro exitoso',
                '#10B981'
            );

            setTimeout(() => {

                window.location.href =
                    "../index.html";

            }, 1500);

        } catch (error) {

            console.error(error);

            let errorMessage =
                'Error al registrar usuario';

            switch (error.code) {

                case 'auth/email-already-in-use':
                    errorMessage =
                        'Este correo ya está registrado';
                    break;

                case 'auth/invalid-email':
                    errorMessage =
                        'Correo inválido';
                    break;

                case 'auth/weak-password':
                    errorMessage =
                        'Contraseña muy débil';
                    break;

            }

            showMessage(errorMessage);

            btnSubmit.disabled = false;

            btnSubmit.innerHTML =
                originalText;

        }

    });

});