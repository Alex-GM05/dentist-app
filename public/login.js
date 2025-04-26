import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAmuMId-e9LiO0cxadGRtxYBK9Tqi2khdI",
  authDomain: "dentist-app-2bb07.firebaseapp.com",
  projectId: "dentist-app-2bb07",
  storageBucket: "dentist-app-2bb07.firebasestorage.app",
  messagingSenderId: "410183687912",
  appId: "1:410183687912:web:43ee87e4a9122edb74b35d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Función para registrar usuario con rol
window.registrar = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const rol = document.getElementById("rol").value;

  try {
    // Validar si el correo ya está en la colección con otro rol
    const querySnapshot = await getDoc(doc(db, "users", email));
    if (querySnapshot.exists()) {
      const data = querySnapshot.data();
      if (data.rol !== rol) {
        alert(`Este correo ya está registrado como ${data.rol}. No puede registrarse como ${rol}.`);
        return;
      }
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email,
      rol
    });

    alert("Usuario registrado correctamente.");
    redireccionarSegunRol(rol);
  } catch (e) {
    alert("Error al registrarse: " + e.message);
  }
};

// Función para iniciar sesión
window.login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Obtener el rol desde Firestore
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { rol } = docSnap.data();
      redireccionarSegunRol(rol);
    } else {
      alert("No se encontró información de usuario.");
    }
  } catch (e) {
    alert("Error al iniciar sesión: " + e.message);
  }
};

// Función para redirigir al usuario según su rol
function redireccionarSegunRol(rol) {
  if (rol === "admin") {
    window.location.href = "admin.html";
  } else if (rol === "paciente") {
    window.location.href = "paciente.html";
  } else {
    alert("Rol no reconocido.");
  }
}
