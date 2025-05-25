import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAmuMId-e9LiO0cxadGRtxYBK9Tqi2khdI",
  authDomain: "dentist-app-2bb07.firebaseapp.com",
  projectId: "dentist-app-2bb07",
  storageBucket: "dentist-app-2bb07.appspot.com",
  messagingSenderId: "410183687912",
  appId: "1:410183687912:web:43ee87e4a9122edb74b35d"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Escuchar el evento del formulario
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      Swal.fire("Error", "Completa todos los campos", "error");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        Swal.fire("Éxito", "Sesión iniciada correctamente", "success").then(() => {
          window.location.href = "admin.html";
        });
      })
      .catch((error) => {
        console.error("Error al iniciar sesión:", error.message);
        Swal.fire("Error", "Correo o contraseña incorrectos", "error");
      });
  });
});
