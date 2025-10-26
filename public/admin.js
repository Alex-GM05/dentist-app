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
let db, auth, storage;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  auth = firebase.auth();
  storage = firebase.storage(); // Esta línea debe funcionar ahora
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
          fecha: data.fecha || (data.createdAt ? data.createdAt.toDate().toLocaleDateString() : "Sin fecha"),
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
          fecha: data.fecha || (data.createdAt ? data.createdAt.toDate().toLocaleDateString() : "Sin fecha"),
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

// Función para generar el odontograma en vista previa
function generarOdontogramaPreview(odontogramaData) {
  if (!odontogramaData || Object.keys(odontogramaData).length === 0) {
    return "<p>No hay datos del odontograma.</p>";
  }

  let html = `
    <table class="odontograma-table-preview">
      <thead>
        <tr>
          <th class="tooth-section-preview">OD</th>
          <th class="tooth-section-preview">DX</th>
          <th class="tooth-section-preview">TX</th>
          <th class="tooth-section-preview">OD</th>
          <th class="tooth-section-preview">DX</th>
          <th class="tooth-section-preview">TX</th>
        </tr>
      </thead>
      <tbody>
  `;

  // Dientes superiores (18 a 28)
  const dientesSuperiores = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];

  // Dientes inferiores (48 to 38)
  const dientesInferiores = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  // Crear filas para dientes superiores
  for (let i = 0; i < 8; i++) {
    html += '<tr>';

    // Lado izquierdo (OD, DX, TX)
    for (let j = 0; j < 3; j++) {
      if (j === 0) {
        // OD - Solo mostrar número
        html += `<td style="background-color: #f0f0f0; font-weight: bold;">${dientesSuperiores[i]}</td>`;
      } else {
        // DX y TX - Mostrar datos
        const key = `diente_${dientesSuperiores[i]}_${['OD', 'DX', 'TX'][j]}`;
        html += `<td>${odontogramaData[key] || "-"}</td>`;
      }
    }

    // Lado derecho (OD, DX, TX)
    for (let j = 0; j < 3; j++) {
      if (j === 0) {
        // OD - Solo mostrar número
        html += `<td style="background-color: #f0f0f0; font-weight: bold;">${dientesSuperiores[i + 8]}</td>`;
      } else {
        // DX y TX - Mostrar datos
        const key = `diente_${dientesSuperiores[i + 8]}_${['OD', 'DX', 'TX'][j]}`;
        html += `<td>${odontogramaData[key] || "-"}</td>`;
      }
    }

    html += '</tr>';
  }

  // Separador entre arcadas
  html += '<tr><td colspan="6" style="background-color: #f0f0f0; text-align: center; font-weight: bold;">Arcada Inferior</td></tr>';

  // Crear filas para dientes inferiores
  for (let i = 0; i < 8; i++) {
    html += '<tr>';

    // Lado izquierdo (OD, DX, TX)
    for (let j = 0; j < 3; j++) {
      if (j === 0) {
        // OD - Solo mostrar número
        html += `<td style="background-color: #f0f0f0; font-weight: bold;">${dientesInferiores[i]}</td>`;
      } else {
        // DX y TX - Mostrar datos
        const key = `diente_${dientesInferiores[i]}_${['OD', 'DX', 'TX'][j]}`;
        html += `<td>${odontogramaData[key] || "-"}</td>`;
      }
    }

    // Lado derecho (OD, DX, TX)
    for (let j = 0; j < 3; j++) {
      if (j === 0) {
        // OD - Solo mostrar número
        html += `<td style="background-color: #f0f0f0; font-weight: bold;">${dientesInferiores[i + 8]}</td>`;
      } else {
        // DX y TX - Mostrar datos
        const key = `diente_${dientesInferiores[i + 8]}_${['OD', 'DX', 'TX'][j]}`;
        html += `<td>${odontogramaData[key] || "-"}</td>`;
      }
    }

    html += '</tr>';
  }

  html += `</tbody></table>`;

  return html;
}

// Mostrar historial de odontología
function mostrarHistorialOdontologia(data, id) {
  const detalleHistorial = document.getElementById("detalleHistorial");
  const costos = Array.isArray(data.costos) ? data.costos : [];
  const abonos = Array.isArray(data.abonos) ? data.abonos : [];
  const imagenes = Array.isArray(data.imagenesAdjuntas) ? data.imagenesAdjuntas : [];
  const odontograma = data.odontograma || {};

  // Calcular totales
  const totalCostos = costos.reduce((total, costo) => total + (Number(costo.costo) || 0), 0);
  const totalAbonos = abonos.reduce((total, abono) => total + (Number(abono.monto) || 0), 0);
  const saldoPendiente = totalCostos - totalAbonos;

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
      
      <div class="historial-section">
        <h4>🦷 Odontograma</h4>
        <div class="preview-odontograma">
          ${generarOdontogramaPreview(odontograma)}
          ${data.observacionesOdontograma ? `<p><strong>Observaciones:</strong> ${data.observacionesOdontograma}</p>` : ''}
        </div>
      </div>

      <div class="historial-section">
        <h4>📋 Receta médica</h4>
        <p>${data.receta || "Sin receta"}</p>
      </div>
      
      ${costos.length > 0 || abonos.length > 0 ? `
      <div class="historial-section">
        <h4>💰 Información Financiera</h4>
        
        ${costos.length > 0 ? `
        <h5>Costos del Tratamiento</h5>
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
          </tbody>
        </table>
        ` : ''}
        
        ${abonos.length > 0 ? `
        <h5>Abonos Realizados</h5>
        <table class="abonos-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Método</th>
            </tr>
          </thead>
          <tbody>
            ${abonos.map((abono, index) => `
              <tr>
                <td>${abono.fecha || "No especificado"}</td>
                <td>${abono.concepto || "No especificado"}</td>
                <td>$${Number(abono.monto || 0).toFixed(2)}</td>
                <td>${abono.metodo || "No especificado"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        ` : ''}
        
        <!-- RESUMEN FINANCIERO -->
        <div class="resumen-financiero">
          <h5>Resumen Financiero</h5>
          <table class="resumen-table">
            <tr>
              <td><strong>Total de costos:</strong></td>
              <td>$${totalCostos.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Total abonado:</strong></td>
              <td>$${totalAbonos.toFixed(2)}</td>
            </tr>
            <tr class="${saldoPendiente > 0 ? 'saldo-pendiente' : 'saldo-cero'}">
              <td><strong>Saldo pendiente:</strong></td>
              <td><strong>$${saldoPendiente.toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>
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
        <button onclick="modificarPaciente()" class="btn-secondary">✏️ Modificar</button>
        <button onclick="eliminarRegistroCompleto('odontologia', '${id}', '${data.nombre || "este paciente"}')" class="btn-danger">🗑️ Eliminar Registro</button>
      </div>
    </div>
  `;

  detalleHistorial.innerHTML = html;
}

// Mostrar historial de podología
// Mostrar historial de podología (VERSIÓN COMPLETA)
function mostrarHistorialPodologia(data, id) {
  const detalleHistorial = document.getElementById("detalleHistorial");
  const costos = Array.isArray(data.costos) ? data.costos : [];
  const abonos = Array.isArray(data.abonos) ? data.abonos : [];
  // Corregido: Leer 'imagenes' que es un array de objetos {url, path, nombre, fecha}
  const imagenes = Array.isArray(data.imagenes) ? data.imagenes : [];

  // Calcular totales (como ya lo teníamos)
  const totalCostos = costos.reduce((total, costo) => total + (Number(costo.costo) || 0), 0);
  const totalAbonos = abonos.reduce((total, abono) => total + (Number(abono.monto) || 0), 0);
  const saldoPendiente = totalCostos - totalAbonos;

  // Helper para crear líneas clave-valor y evitar repetir '|| "No especificado"'
  const kv = (label, value) => {
      // Si el valor es undefined, null, o vacío, no mostrar la línea
      if (value === undefined || value === null || value === "") return '';
      // Si es un objeto (como antecedentes), mostrar mensaje genérico o manejarlo específicamente si es necesario
      if (typeof value === 'object' && value !== null) return `<p><strong>${label}:</strong> (Ver detalles abajo)</p>`;
      return `<p><strong>${label}:</strong> ${value}</p>`;
  };

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
          ${kv("Nombre", data.nombre)}
          ${kv("Sexo", data.sexo)}
          ${kv("Edad", data.edad)}
          ${kv("Estado Civil", data.estadoCivil)}
          ${kv("Email", data.email)}
          ${kv("Teléfono", data.telefono)}
          ${kv("Ocupación", data.ocupacion)}
          ${kv("Dirección", data.direccion)}
          ${kv("Fecha Consulta", data.fecha)}
        </div>
        ${kv("Objetivo Visita", data.objetivoVisita)}
        ${kv("Alergias", data.alergias)}
      </div>

      <div class="historial-section">
          <h4>🏥 Antecedentes Médicos</h4>
          <div class="grid-3">
              ${kv("Embarazo", data.antecedentesMedicos?.embarazo)}
              ${kv("Hipertensión", data.antecedentesMedicos?.hipertension)}
              ${kv("Insuf. Cardíaca", data.antecedentesMedicos?.insuficienciaCardiaca)}
              ${kv("Marcapasos", data.antecedentesMedicos?.marcapasos)}
              ${kv("Diabetes", data.antecedentesMedicos?.diabetes)}
              ${kv("Cáncer", data.antecedentesMedicos?.cancer)}
              ${kv("Dermatitis", data.antecedentesMedicos?.dermatitis)}
              ${kv("Epilepsia", data.antecedentesMedicos?.epilepsia)}
              ${kv("Micosis", data.antecedentesMedicos?.micosis)}
              ${kv("Isquemias", data.antecedentesMedicos?.isquemias)}
              ${kv("Trombosis", data.antecedentesMedicos?.trombosis)}
          </div>
      </div>

      ${data.sexo === 'Mujer' ? `
      <div class="historial-section">
        <h4>👩 Solo Mujeres</h4>
        <div class="grid-2">
          ${kv("Uso de tacón", data.usoTacon)}
          ${data.usoTacon === 'Sí' ? kv("Altura Tacón (cm)", data.alturaTacon) : ''}
          ${data.usoTacon === 'Sí' ? kv("Horas/día", data.horasUsoTacon) : ''}
          ${data.usoTacon === 'Sí' ? kv("Días/semana", data.diasTacon) : ''}
        </div>
      </div>
      ` : ''}

       <div class="historial-section">
          <h4>📊 Exploración Física</h4>
          <div class="grid-3">
              ${kv("Peso (kg)", data.peso)}
              ${kv("Estatura (cm)", data.estatura)}
              ${kv("I.M.C.", data.imc)}
              ${kv("F.C.", data.frecuenciaCardiaca)}
              ${kv("Pulso", data.pulso)}
              ${kv("Temp (°C)", data.temperatura)}
          </div>
      </div>

       <div class="historial-section">
          <h4>🍽️ Hábitos y Alimentación</h4>
          <div class="grid-2">
              ${kv("Alcohol", data.alcohol)}
              ${kv("Cigarro", data.cigarro)}
              ${kv("¿Desvela?", data.desvela)}
              ${kv("Agua (L/día)", data.agua)}
              ${kv("Medicamentos/Supl.", data.medicamentos)}
              ${kv("Calzado Diario", data.calzado)}
          </div>
          <h5 style="margin-top: 1rem;">Alimentación</h5>
           <div class="grid-3">
              ${kv("Carne", data.carne)}
              ${kv("Pescado", data.pescado)}
              ${kv("Verduras", data.verduras)}
              ${kv("Frutas", data.frutas)}
              ${kv("Pan", data.pan)}
          </div>
           <h5 style="margin-top: 1rem;">Ejercicio</h5>
           <div class="grid-3">
               ${kv("¿Realiza?", data.ejercicio)}
               ${kv("Tipo", data.tipoEjercicio)}
               ${kv("Frecuencia (sem.)", data.frecuenciaEjercicio)}
           </div>
           ${kv("Cirugías", data.cirugias)}
           ${kv("Bebidas (Temp.)", data.bebidas)}
           ${kv("Frecuencia Bebidas", data.frecuenciaBebidas)}
           ${kv("Hábitos Limpieza", data.habitosLimpieza)}
           ${kv("Productos Específicos", data.productosEspecificos)}
      </div>


      ${costos.length > 0 || abonos.length > 0 ? `
      <div class="historial-section">
        <h4>💰 Información Financiera</h4>
       ${costos.length > 0 ? `
            <h3 style="margin-top: 1rem; color: #264653;">Cargos / Tratamientos</h3>
            <table class="costos-table">
                <thead><tr><th>Fecha</th><th>Concepto</th><th>Costo</th></tr></thead>
                <tbody>
                    ${costos.map(c => `<tr><td>${c.fecha||"-"}</td><td>${c.concepto||"-"}</td><td>$${Number(c.costo||0).toFixed(2)}</td></tr>`).join("")}
                </tbody>
            </table>
        ` : '<p>No se registraron cargos.</p>'}
        ${abonos.length > 0 ? `
            <h3 style="margin-top: 1rem; color: #264653;">Abonos / Pagos</h3>
            <table class="abonos-table">
                <thead><tr><th>Fecha</th><th>Concepto</th><th>Monto</th><th>Método</th></tr></thead>
                <tbody>
                    ${abonos.map(a => `<tr><td>${a.fecha||"-"}</td><td>${a.concepto||"-"}</td><td>$${Number(a.monto||0).toFixed(2)}</td><td>${a.metodo||"-"}</td></tr>`).join("")}
                </tbody>
            </table>
        ` : '<p style="margin-top: 1rem;">No se registraron abonos.</p>'}
        <div class="resumen-financiero" style="margin-top: 1.5rem;">
            <h3 style="margin-bottom: 0.5rem;">Resumen</h3>
            <div class="preview-kv">
                ${kv("Total Cargos", `$${Number(totalCostos).toFixed(2)}`)}
                ${kv("Total Abonos", `$${Number(totalAbonos).toFixed(2)}`)}
                ${kv("Saldo Pendiente", `<strong style="color: ${saldoPendiente > 0 ? '#e63946' : '#2a9d8f'};">$${Number(saldoPendiente).toFixed(2)}</strong>`)}
            </div>
        </div>
      </div>
      ` : ''}

       <div class="historial-section">
          <h4>📝 Observaciones y Tratamiento</h4>
          <p>${data.observaciones || "Sin observaciones registradas."}</p>
      </div>

      ${imagenes.length > 0 ? `
      <div class="historial-section">
        <h4>🖼️ Imágenes Adjuntas</h4>
        <div class="images-grid">
          ${imagenes.map((imgData, index) => `
            <div class="thumb">
              <a href="${imgData.url || '#'}" target="_blank">
                <img src="${imgData.url || 'placeholder.png'}" alt="${imgData.nombre || `Imagen ${index + 1}`}">
              </a>
              <p style="font-size:0.7rem; text-align:center; margin-top: 4px;">${imgData.nombre || 'imagen'}</p>
            </div>
          `).join("")}
        </div>
      </div>
      ` : ''}

      <div class="historial-actions">
        <button onclick="window.location.href='preview-podologia.html?id=${id}'" class="btn-primary">👁️ Ver Vista Previa</button>
        <button onclick="modificarPaciente()" class="btn-secondary">✏️ Modificar</button>
        <button onclick="eliminarRegistroCompleto('podologia', '${id}', '${data.nombre || "este paciente"}')" class="btn-danger">🗑️ Eliminar Registro</button>
      </div>
    </div>
  `;

  detalleHistorial.innerHTML = html;
}

// Eliminar registro COMPLETO (Firestore + Storage)
async function eliminarRegistroCompleto(especialidad, id, nombrePaciente) {
  const confirmacion = await Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Quieres eliminar COMPLETAMENTE el registro de ${nombrePaciente}? Esta acción no se puede deshacer y eliminará también las imágenes.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar todo',
    cancelButtonText: 'Cancelar'
  });

  if (confirmacion.isConfirmed) {
    try {
      // Primero eliminar las imágenes del Storage
      let imagenesPaths = [];

      if (especialidad === "odontologia") {
        const doc = await db.collection("historial-odontologia").doc(id).get();
        if (doc.exists) {
          const data = doc.data();
          imagenesPaths = Array.isArray(data.imagenesAdjuntas) ? data.imagenesAdjuntas : [];
        }
      } else if (especialidad === "podologia") {
        const doc = await db.collection("historial-podologia").doc(id).get();
        if (doc.exists) {
          const data = doc.data();
          if (Array.isArray(data.imagenes)) {
            imagenesPaths = data.imagenes
              .map(imgData => imgData?.path) // Obtiene el path de cada objeto
              .filter(path => path && typeof path === 'string');
          } else {
            imagenesPaths = [];
          }
        }
      }
      // Eliminar cada imagen del Storage (usando URL para odonto, path para podo)
      console.log("Intentando eliminar de Storage:", imagenesPaths); // Log para depurar
      for (const itemToDelete of imagenesPaths) {
        try {
          let imgRef;
          if (itemToDelete.startsWith('https://')) {
            // Es una URL (Odontología)
            imgRef = storage.refFromURL(itemToDelete);
          } else if (itemToDelete.includes('/')) {
            // Es un path (Podología)
            imgRef = storage.ref(itemToDelete);
          } else {
            console.warn("Item inválido para eliminar:", itemToDelete);
            continue; // Saltar este item
          }

          await imgRef.delete();
          console.log("Archivo eliminado de Storage:", itemToDelete);
        } catch (imgError) {
          // Es común que falle si el archivo ya no existe, usamos warn
          console.warn("No se pudo eliminar de Storage (puede que ya no exista):", itemToDelete, imgError.code);
        }
      }

      // Finalmente eliminar el documento de Firestore
      if (especialidad === "odontologia") {
        await db.collection("historial-odontologia").doc(id).delete();
      } else if (especialidad === "podologia") {
        await db.collection("historial-podologia").doc(id).delete();
      }

      Swal.fire(
        '¡Eliminado completamente!',
        `El registro de ${nombrePaciente} y todas sus imágenes han sido eliminados.`,
        'success'
      );

      // Recargar la lista de pacientes
      cargarPacientes();
      document.getElementById("detalleHistorial").innerHTML = "";

    } catch (error) {
      console.error("Error eliminando registro completo:", error);
      Swal.fire(
        'Error',
        `No se pudo eliminar completamente el registro: ${error.message}`,
        'error'
      );
    }
  }
}

// Modificar paciente - Redirige a la página de edición
function modificarPaciente() {
  const pacienteSelect = document.getElementById("pacienteSelect");
  const selectedValue = pacienteSelect.value;

  if (!selectedValue) {
    Swal.fire('Info', 'Por favor selecciona un paciente primero.', 'info');
    return;
  }

  const [especialidad, id] = selectedValue.split("-");
  if (especialidad === "odontologia") {
    // Pasar el ID como parámetro para edición
    window.location.href = `modificar-odontologia.html?edit=${id}`;
  } else if (especialidad === "podologia") {
    // Pasar el ID como parámetro para edición
    window.location.href = `modificar-podologia.html?edit=${id}`;
  }
}

// Eliminar paciente (alias para consistencia)
function eliminarPaciente() {
  const pacienteSelect = document.getElementById("pacienteSelect");
  const selectedValue = pacienteSelect.value;

  if (!selectedValue) {
    Swal.fire('Info', 'Por favor selecciona un paciente primero.', 'info');
    return;
  }

  const [especialidad, id] = selectedValue.split("-");
  const nombre = pacienteSelect.options[pacienteSelect.selectedIndex].dataset.nombre;

  eliminarRegistroCompleto(especialidad, id, nombre);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  console.log("Panel de administrador cargado");
});