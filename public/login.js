import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAmuMId-e9LiO0cxadGRtxYBK9Tqi2khdI",
  authDomain: "dentist-app-2bb07.firebaseapp.com",
  projectId: "dentist-app-2bb07",
  storageBucket: "dentist-app-2bb07.appspot.com",
  messagingSenderId: "410183687912",
  appId: "1:410183687912:web:43ee87e4a9122edb74b35d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Login con verificación de rol
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    Swal.fire("Error", "Por favor completa todos los campos", "error");
    return;
  }

  try {
    await setPersistence(auth, browserLocalPersistence);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Consultar el rol del usuario en Firestore
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const rol = data.rol;

      if (rol === "admin") {
        Swal.fire("Éxito", "Bienvenido administrador", "success").then(() => {
          window.location.href = "admin.html";
        });
      } else if (rol === "paciente") {
        Swal.fire("Éxito", "Bienvenido paciente", "success").then(() => {
          window.location.href = "paciente.html";
        });
      } else {
        Swal.fire("Error", "Rol no reconocido", "error");
      }
    } else {
      Swal.fire("Error", "No se encontró información de usuario", "error");
    }
  } catch (error) {
    Swal.fire("Error", error.message, "error");
  }
});
