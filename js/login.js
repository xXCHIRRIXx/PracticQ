import { auth, db } from './firebase-config.js';

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('login-form');
    const btnSubmit = loginForm.querySelector('.btn-primary');
    const message = document.getElementById('login-message');

    // ==========================
    // MOSTRAR / OCULTAR PASSWORD
    // ==========================

    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('toggle-password');

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
    // LOGIN
    // ==========================

    loginForm.addEventListener('submit', async (event) => {

        event.preventDefault();

        const correo = document.getElementById('correo').value.trim();
        const password = document.getElementById('password').value;

        const originalText = btnSubmit.innerHTML;

        // Limpiar mensajes previos
        message.textContent = '';

        // Estado loading
        btnSubmit.disabled = true;

        btnSubmit.innerHTML = `
            <span class="loader"></span>
            Ingresando...
        `;

        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    correo,
                    password
                );

            const docSnap = await getDoc(
                doc(
                    db,
                    "usuarios",
                    userCredential.user.uid
                )
            );

            if (!docSnap.exists()) {
                throw new Error(
                    "No se encontró el perfil del usuario."
                );
            }

            const userData = docSnap.data();

            message.style.color = '#10B981';
            message.textContent =
                'Acceso correcto. Redirigiendo...';

            btnSubmit.innerHTML = '✓ Bienvenido';

            btnSubmit.style.background =
                '#10B981';

            setTimeout(() => {

                switch (userData.rol) {

                    case 'admin':
                        window.location.href =
                            "./html/admin.html";
                        break;

                    case 'lider':
                        window.location.href =
                            "./html/lider.html";
                        break;

                    default:
                        window.location.href =
                            "./html/practicante.html";
                }

            }, 1000);

        } catch (error) {

            console.error(error);

            let errorMessage =
                'Correo o contraseña incorrectos.';

            switch (error.code) {

                case 'auth/user-not-found':
                    errorMessage =
                        'El usuario no existe.';
                    break;

                case 'auth/wrong-password':
                    errorMessage =
                        'Contraseña incorrecta.';
                    break;

                case 'auth/invalid-email':
                    errorMessage =
                        'Correo inválido.';
                    break;

                case 'auth/too-many-requests':
                    errorMessage =
                        'Demasiados intentos. Intenta más tarde.';
                    break;
            }

            message.style.color = '#EF4444';
            message.textContent = errorMessage;

            btnSubmit.style.background =
                '#EF4444';

            btnSubmit.innerHTML =
                'Error de acceso';

            setTimeout(() => {

                btnSubmit.disabled = false;

                btnSubmit.innerHTML =
                    originalText;

                btnSubmit.style.background = '';

            }, 2500);

        }

    });

    // ==========================
    // EASTER EGG ADMIN
    // CTRL + SHIFT + A
    // ==========================

    document.addEventListener('keydown', (e) => {

        if (
            e.ctrlKey &&
            e.shiftKey &&
            e.key.toUpperCase() === 'A'
        ) {

            const adminModal =
                document.getElementById(
                    'admin-secret-register'
                );

            if (adminModal) {
                adminModal.style.display =
                    'block';
            }

        }

    });

    // ==========================
    // REGISTRO ADMIN
    // ==========================

    const adminForm =
        document.getElementById(
            'admin-register-form'
        );

    if (adminForm) {

        adminForm.addEventListener(
            'submit',
            async (e) => {

                e.preventDefault();

                const nombre =
                    document.getElementById(
                        'admin-nombre'
                    ).value;

                const correo =
                    document.getElementById(
                        'admin-correo'
                    ).value;

                const password =
                    document.getElementById(
                        'admin-password'
                    ).value;

                try {

                    const cred =
                        await createUserWithEmailAndPassword(
                            auth,
                            correo,
                            password
                        );

                    await setDoc(
                        doc(
                            db,
                            "usuarios",
                            cred.user.uid
                        ),
                        {
                            nombre,
                            correo,
                            rol: 'admin',
                            fechaRegistro:
                                new Date().toISOString()
                        }
                    );

                    message.style.color =
                        '#10B981';

                    message.textContent =
                        'Administrador creado correctamente';

                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);

                } catch (error) {

                    console.error(error);

                    message.style.color =
                        '#EF4444';

                    message.textContent =
                        'Error al registrar administrador';

                }

            }
        );

    }

});