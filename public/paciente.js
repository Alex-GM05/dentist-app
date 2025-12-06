import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Hacer la función global para que funcione con el onclick del HTML
window.cerrarSesion = async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Usuario logueado:", user.uid);
    await cargarOpcionesPaciente(user.uid);
  } else {
    window.location.href = "index.html";
  }
});

// Función principal para verificar historiales
async function cargarOpcionesPaciente(userId) {
  const container = document.getElementById("botones-container");
  const loader = document.getElementById("loader");
  
  try {
    // 1. Consultar Odontología
    // Nota: Usamos userId. Si tus registros viejos no tienen userId, podrías necesitar buscar por email.
    const qOdonto = query(
      collection(db, "historial-odontologia"), 
      where("userId", "==", userId)
    );
    const snapOdonto = await getDocs(qOdonto);
    const tieneOdonto = !snapOdonto.empty;

    // 2. Consultar Podología
    const qPodo = query(
      collection(db, "historial-podologia"), 
      where("userId", "==", userId)
    );
    const snapPodo = await getDocs(qPodo);
    const tienePodo = !snapPodo.empty;

    // 3. Renderizar Botones
    loader.style.display = "none";
    container.innerHTML = ""; // Limpiar

    if (!tieneOdonto && !tienePodo) {
      container.innerHTML = "<p>No se encontraron historiales médicos asociados a tu cuenta.</p>";
      return;
    }

    if (tieneOdonto) {
      const btnOdonto = document.createElement("button");
      btnOdonto.textContent = "🦷 Ver Historial Odontología";
      btnOdonto.className = "btn-primary btn-area";
      btnOdonto.onclick = () => mostrarDetalles("odontologia", snapOdonto);
      container.appendChild(btnOdonto);
    }

    if (tienePodo) {
      const btnPodo = document.createElement("button");
      btnPodo.textContent = "🦶 Ver Historial Podología";
      // Si hay dos botones, usamos un estilo secundario o margen para separarlos
      btnPodo.className = "btn-primary btn-area"; 
      if (tieneOdonto) btnPodo.style.marginLeft = "10px";
      btnPodo.onclick = () => mostrarDetalles("podologia", snapPodo);
      container.appendChild(btnPodo);
    }

  } catch (error) {
    console.error("Error cargando datos:", error);
    loader.innerText = "Error al cargar la información. Por favor recarga la página.";
  }
}

// Función para renderizar el detalle (Receta, Cargos, Abonos)
function mostrarDetalles(tipo, snapshot) {
  const detalleDiv = document.getElementById("historial-detalle");
  detalleDiv.innerHTML = ""; // Limpiar vista anterior
  
  const titulo = document.createElement("h2");
  titulo.textContent = tipo === "odontologia" ? "Historial Odontológico" : "Historial Podológico";
  titulo.style.borderBottom = "2px solid var(--primary)";
  titulo.style.paddingBottom = "10px";
  detalleDiv.appendChild(titulo);

  // Recorrer cada documento encontrado (puede haber varios historiales/citas)
  snapshot.forEach(doc => {
    const data = doc.data();
    const card = document.createElement("div");
    card.className = "historial-card";

    // Fecha del historial
    const fecha = data.fecha || "Fecha no registrada";
    
    // --- Lógica Financiera ---
    const costos = Array.isArray(data.costos) ? data.costos : [];
    const abonos = Array.isArray(data.abonos) ? data.abonos : [];
    
    // Calcular totales
    // Nota: En odontología usabas 'costo', en podología 'monto' para abonos según tus scripts anteriores
    // Aquí hacemos un manejo seguro.
    const totalCargos = costos.reduce((sum, c) => sum + (Number(c.costo) || 0), 0);
    const totalAbonos = abonos.reduce((sum, a) => sum + (Number(a.monto) || Number(a.cantidad) || 0), 0);
    const saldo = totalCargos - totalAbonos;

    // Generar HTML de la tarjeta
    let htmlContent = `
      <h3 style="color: #264653;">Consulta: ${fecha}</h3>
      <p><strong>Motivo:</strong> ${data.motivoConsulta || data.objetivoVisita || "No especificado"}</p>
      
      <div style="margin-top: 15px;">
        <h4 style="color: #2a9d8f;">💊 Receta / Indicaciones</h4>
        <div style="background: #f9f9f9; padding: 10px; border-left: 4px solid #2a9d8f; white-space: pre-line;">
          ${data.receta || data.observaciones || "Sin receta registrada."}
        </div>
      </div>

      <div style="margin-top: 15px;">
        <h4 style="color: #2a9d8f;">💰 Estado de Cuenta</h4>
    `;

    // Tabla de Cargos
    if (costos.length > 0) {
      htmlContent += `
        <h5>Cargos</h5>
        <table class="tabla-finanzas">
          <thead><tr><th>Concepto</th><th>Monto</th></tr></thead>
          <tbody>
            ${costos.map(c => `
              <tr>
                <td>${c.concepto}</td>
                <td>$${Number(c.costo).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>`;
    }

    // Tabla de Abonos
    if (abonos.length > 0) {
      htmlContent += `
        <h5 style="margin-top:10px;">Abonos Realizados</h5>
        <table class="tabla-finanzas">
          <thead><tr><th>Fecha</th><th>Método</th><th>Monto</th></tr></thead>
          <tbody>
            ${abonos.map(a => `
              <tr>
                <td>${a.fecha}</td>
                <td>${a.metodo || 'Efectivo'}</td>
                <td>$${(Number(a.monto) || Number(a.cantidad) || 0).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>`;
    } else {
        htmlContent += `<p style="font-size: 0.9rem; color: #666;">No hay abonos registrados.</p>`;
    }

    // Totales
    htmlContent += `
        <div style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 10px; text-align: right;">
          <p>Total Cargos: $${totalCargos.toFixed(2)}</p>
          <p>Total Abonado: $${totalAbonos.toFixed(2)}</p>
          <p style="font-size: 1.1rem;">Saldo Pendiente: <span class="${saldo > 0 ? 'saldo-pendiente' : 'saldo-cero'}">$${saldo.toFixed(2)}</span></p>
        </div>
      </div>
    `;

    card.innerHTML = htmlContent;
    detalleDiv.appendChild(card);
  });
}