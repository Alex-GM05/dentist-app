// Firebase init
const firebaseConfig = {
  apiKey: "AIzaSyAmuMId-e9LiO0cxadGRtxYBK9Tqi2khdI",
  authDomain: "dentist-app-2bb07.firebaseapp.com",
  projectId: "dentist-app-2bb07",
  storageBucket: "dentist-app-2bb07.firebasestorage.app",
  messagingSenderId: "410183687912",
  appId: "1:410183687912:web:43ee87e4a9122edb74b35d"
};

// Inicializar Firebase
let db, auth;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  auth = firebase.auth();
  console.log("Firebase inicializado correctamente para admin");
} catch (error) {
  console.error("Error inicializando Firebase:", error);
}

// Verificar autenticación
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    console.log("Usuario autenticado:", user.uid);
    // Cargar pacientes de odontología por defecto
    cargarPacientes();
  }
});

// Cerrar sesión
function logout() {
  auth.signOut()
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Error al cerrar sesión:", error);
      alert("Error al cerrar sesión: " + error.message);
    });
}

// Cargar pacientes según la especialidad seleccionada
async function cargarPacientes() {
  const especialidadSelect = document.getElementById("especialidadSelect");
  const pacienteSelect = document.getElementById("pacienteSelect");
  const especialidad = especialidadSelect.value;
  
  pacienteSelect.innerHTML = '<option value="">Seleccione un paciente</option>';
  
  if (!especialidad) return;
  
  try {
    let pacientes = [];
    
    if (especialidad === "odontologia" || especialidad === "todos") {
      const querySnapshotOdonto = await db.collection("historial-odontologia")
        .orderBy("createdAt", "desc")
        .get();
      
      querySnapshotOdonto.forEach((doc) => {
        const data = doc.data();
        pacientes.push({
          id: doc.id,
          nombre: data.nombre || "Sin nombre",
          email: data.email || "",
          fecha: data.fecha || data.createdAt?.toDate().toLocaleDateString() || "Sin fecha",
          especialidad: "odontologia",
          data: data
        });
      });
    }
    
    if (especialidad === "podologia" || especialidad === "todos") {
      const querySnapshotPodo = await db.collection("historial-podologia")
        .orderBy("createdAt", "desc")
        .get();
      
      querySnapshotPodo.forEach((doc) => {
        const data = doc.data();
        pacientes.push({
          id: doc.id,
          nombre: data.nombre || "Sin nombre",
          email: data.email || "",
          fecha: data.fecha || data.createdAt?.toDate().toLocaleDateString() || "Sin fecha",
          especialidad: "podologia",
          data: data
        });
      });
    }
    
    // Eliminar duplicados por nombre (opcional)
    const pacientesUnicos = [];
    const nombresVistos = new Set();
    
    pacientes.forEach(paciente => {
      if (!nombresVistos.has(paciente.nombre)) {
        nombresVistos.add(paciente.nombre);
        pacientesUnicos.push(paciente);
      }
    });
    
    // Ordenar alfabéticamente
    pacientesUnicos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    // Llenar el select
    pacientesUnicos.forEach(paciente => {
      const option = document.createElement("option");
      option.value = `${paciente.especialidad}-${paciente.id}`;
      option.textContent = `${paciente.nombre} (${paciente.especialidad}) - ${paciente.fecha}`;
      option.dataset.nombre = paciente.nombre;
      pacienteSelect.appendChild(option);
    });
    
  } catch (error) {
    console.error("Error cargando pacientes:", error);
    alert("Error al cargar pacientes: " + error.message);
  }
}

// Buscar por nombre en tiempo real
function buscarPorNombre() {
  const buscarInput = document.getElementById("buscarNombre");
  const pacienteSelect = document.getElementById("pacienteSelect");
  const searchTerm = buscarInput.value.toLowerCase();
  
  if (!searchTerm) {
    // Mostrar todos si no hay término de búsqueda
    for (let i = 0; i < pacienteSelect.options.length; i++) {
      pacienteSelect.options[i].style.display = "";
    }
    return;
  }
  
  // Filtrar opciones
  for (let i = 0; i < pacienteSelect.options.length; i++) {
    const option = pacienteSelect.options[i];
    if (option.value && option.dataset.nombre.toLowerCase().includes(searchTerm)) {
      option.style.display = "";
    } else {
      option.style.display = "none";
    }
  }
}

// Cargar historial del paciente seleccionado
async function cargarHistorial() {
  const pacienteSelect = document.getElementById("pacienteSelect");
  const detalleHistorial = document.getElementById("detalleHistorial");
  const selectedValue = pacienteSelect.value;
  
  if (!selectedValue) {
    detalleHistorial.innerHTML = "";
    return;
  }
  
  try {
    const [especialidad, id] = selectedValue.split("-");
    let historialData;
    
    if (especialidad === "odontologia") {
      const doc = await db.collection("historial-odontologia").doc(id).get();
      if (doc.exists) {
        historialData = doc.data();
        mostrarHistorialOdontologia(historialData, id);
      }
    } else if (especialidad === "podologia") {
      const doc = await db.collection("historial-podologia").doc(id).get();
      if (doc.exists) {
        historialData = doc.data();
        mostrarHistorialPodologia(historialData, id);
      }
    }
    
  } catch (error) {
    console.error("Error cargando historial:", error);
    detalleHistorial.innerHTML = `<p class="error">Error al cargar el historial: ${error.message}</p>`;
  }
}

// Mostrar historial de odontología
function mostrarHistorialOdontologia(data, id) {
  const detalleHistorial = document.getElementById("detalleHistorial");
  const costos = Array.isArray(data.costos) ? data.costos : [];
  const imagenes = Array.isArray(data.imagenesAdjuntas) ? data.imagenesAdjuntas : [];
  
  const html = `
    <div class="historial-details">
      <div class="historial-header">
        <h3>Historial de Odontología - ${data.nombre || "Paciente"}</h3>
        <p><strong>ID:</strong> ${id}</p>
        <p><strong>Fecha de creación:</strong> ${data.createdAt ? data.createdAt.toDate().toLocaleString('es-MX') : 'No disponible'}</p>
      </div>
      
      <div class="historial-section">
        <h4>📋 Datos Generales</h4>
        <div class="grid-2">
          <p><strong>Nombre:</strong> ${data.nombre || "No especificado"}</p>
          <p><strong>Edad:</strong> ${data.edad || "No especificado"}</p>
          <p><strong>Sexo:</strong> ${data.sexo || "No especificado"}</p>
          <p><strong>Email:</strong> ${data.email || "No especificado"}</p>
          <p><strong>Teléfono:</strong> ${data.telefono || "No especificado"}</p>
          <p><strong>Fecha de consulta:</strong> ${data.fecha || "No especificado"}</p>
        </div>
      </div>
      
      <div class="historial-section">
        <h4>🎯 Motivo de Consulta</h4>
        <p>${data.motivoConsulta || "No se registró motivo de consulta"}</p>
      </div>
      
      ${costos.length > 0 ? `
      <div class="historial-section">
        <h4>💰 Costos del Tratamiento</h4>
        <table class="costos-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Concepto</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody>
            ${costos.map((costo, index) => `
              <tr>
                <td>${costo.fecha || "No especificado"}</td>
                <td>${costo.concepto || "No especificado"}</td>
                <td>$${Number(costo.costo || 0).toFixed(2)}</td>
              </tr>
            `).join("")}
            <tr class="total-row">
              <td colspan="2" style="text-align: right; font-weight: bold;">Total general:</td>
              <td style="font-weight: bold;">$${Number(data.totalGeneral || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      ` : ''}
      
      ${imagenes.length > 0 ? `
      <div class="historial-section">
        <h4>🖼️ Imágenes Adjuntas</h4>
        <div class="images-grid">
          ${imagenes.map((img, index) => `
            <div class="thumb">
              <a href="${img}" target="_blank">
                <img src="${img}" alt="Imagen ${index + 1}">
              </a>
            </div>
          `).join("")}
        </div>
      </div>
      ` : ''}
      
      <div class="historial-actions">
        <button onclick="window.location.href='preview-odontologia.html?id=${id}'" class="btn-primary">👁️ Ver Vista Previa</button>
        <button onclick="eliminarRegistro('odontologia', '${id}', '${data.nombre || "este paciente"}')" class="btn-danger">🗑️ Eliminar Registro</button>
      </div>
    </div>
  `;
  
  detalleHistorial.innerHTML = html;
}

// Mostrar historial de podología
function mostrarHistorialPodologia(data, id) {
  const detalleHistorial = document.getElementById("detalleHistorial");
  const costos = Array.isArray(data.costos) ? data.costos : [];
  const imagenes = Array.isArray(data.imagenes) ? data.imagenes : [];
  
  const html = `
    <div class="historial-details">
      <div class="historial-header">
        <h3>Historial de Podología - ${data.nombre || "Paciente"}</h3>
        <p><strong>ID:</strong> ${id}</p>
        <p><strong>Fecha de creación:</strong> ${data.createdAt ? data.createdAt.toDate().toLocaleString('es-MX') : 'No disponible'}</p>
      </div>
      
      <div class="historial-section">
        <h4>📋 Datos Generales</h4>
        <div class="grid-2">
          <p><strong>Nombre:</strong> ${data.nombre || "No especificado"}</p>
          <p><strong>Edad:</strong> ${data.edad || "No especificado"}</p>
          <p><strong>Sexo:</strong> ${data.sexo || "No especificado"}</p>
          <p><strong>Email:</strong> ${data.email || "No especificado"}</p>
          <p><strong>Teléfono:</strong> ${data.telefono || "No especificado"}</p>
          <p><strong>Fecha de consulta:</strong> ${data.fecha || "No especificado"}</p>
          <p><strong>Objetivo de la visita:</strong> ${data.objetivoVisita || "No especificado"}</p>
        </div>
      </div>
      
      ${data.sexo === 'Mujer' ? `
      <div class="historial-section">
        <h4>👩 Datos Específicos para Mujeres</h4>
        <div class="grid-2">
          <p><strong>Uso de tacón:</strong> ${data.usoTacon || "No especificado"}</p>
          ${data.usoTacon === 'Sí' ? `
            <p><strong>Altura de tacón:</strong> ${data.alturaTacon || "0"} cm</p>
            <p><strong>Horas de uso diario:</strong> ${data.horasUsoTacon || "0"}</p>
            <p><strong>Días de uso semanal:</strong> ${data.diasTacon || "0"}</p>
          ` : ''}
        </div>
      </div>
      ` : ''}
      
      ${costos.length > 0 ? `
      <div class="historial-section">
        <h4>💰 Costos del Tratamiento</h4>
        <table class="costos-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Concepto</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody>
            ${costos.map((costo, index) => `
              <tr>
                <td>${costo.fecha || "No especificado"}</td>
                <td>${costo.concepto || "No especificado"}</td>
                <td>$${Number(costo.costo || 0).toFixed(2)}</td>
              </tr>
            `).join("")}
            <tr class="total-row">
              <td colspan="2" style="text-align: right; font-weight: bold;">Total general:</td>
              <td style="font-weight: bold;">$${Number(data.totalGeneral || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      ` : ''}
      
      ${imagenes.length > 0 ? `
      <div class="historial-section">
        <h4>🖼️ Imágenes Adjuntas</h4>
        <div class="images-grid">
          ${imagenes.map((img, index) => `
            <div class="thumb">
              <a href="${img.url || img}" target="_blank">
                <img src="${img.url || img}" alt="Imagen ${index + 1}">
              </a>
            </div>
          `).join("")}
        </div>
      </div>
      ` : ''}
      
      <div class="historial-actions">
        <button onclick="window.location.href='preview-podologia.html?id=${id}'" class="btn-primary">👁️ Ver Vista Previa</button>
        <button onclick="eliminarRegistro('podologia', '${id}', '${data.nombre || "este paciente"}')" class="btn-danger">🗑️ Eliminar Registro</button>
      </div>
    </div>
  `;
  
  detalleHistorial.innerHTML = html;
}

// Eliminar registro
async function eliminarRegistro(especialidad, id, nombrePaciente) {
  const confirmacion = await Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Quieres eliminar el registro de ${nombrePaciente}? Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });
  
  if (confirmacion.isConfirmed) {
    try {
      if (especialidad === "odontologia") {
        await db.collection("historial-odontologia").doc(id).delete();
      } else if (especialidad === "podologia") {
        await db.collection("historial-podologia").doc(id).delete();
      }
      
      Swal.fire(
        '¡Eliminado!',
        `El registro de ${nombrePaciente} ha sido eliminado.`,
        'success'
      );
      
      // Recargar la lista de pacientes
      cargarPacientes();
      document.getElementById("detalleHistorial").innerHTML = "";
      
    } catch (error) {
      console.error("Error eliminando registro:", error);
      Swal.fire(
        'Error',
        `No se pudo eliminar el registro: ${error.message}`,
        'error'
      );
    }
  }
}

// Funciones placeholder para los botones (puedes implementarlas luego)
function modificarPaciente() {
  const pacienteSelect = document.getElementById("pacienteSelect");
  const selectedValue = pacienteSelect.value;
  
  if (!selectedValue) {
    Swal.fire('Info', 'Por favor selecciona un paciente primero.', 'info');
    return;
  }
  
  const [especialidad, id] = selectedValue.split("-");
  if (especialidad === "odontologia") {
    window.location.href = `add-odontologia.html?edit=${id}`;
  } else if (especialidad === "podologia") {
    window.location.href = `add-podologia.html?edit=${id}`;
  }
}

function eliminarPaciente() {
  const pacienteSelect = document.getElementById("pacienteSelect");
  const selectedValue = pacienteSelect.value;
  
  if (!selectedValue) {
    Swal.fire('Info', 'Por favor selecciona un paciente primero.', 'info');
    return;
  }
  
  const [especialidad, id] = selectedValue.split("-");
  const nombre = pacienteSelect.options[pacienteSelect.selectedIndex].dataset.nombre;
  
  eliminarRegistro(especialidad, id, nombre);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log("Panel de administrador cargado");
});