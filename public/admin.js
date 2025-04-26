import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
const crearPaciente = async () => {
  await addDoc(collection(db, "pacientes"), {
    nombre: "Paciente nuevo",
    creado: new Date().toISOString()
  });
  alert("Paciente agregado.");
};

const cerrarSesion = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};

// Proteger página
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
  }
});