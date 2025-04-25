import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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

window.login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "app.html";
  } catch (e) {
    alert("Error al iniciar sesión: " + e.message);
  }
};

window.registrar = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Usuario registrado. Ahora puedes iniciar sesión.");
  } catch (e) {
    alert("Error al registrarse: " + e.message);
  }
};
