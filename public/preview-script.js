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
  console.log("Firebase inicializado correctamente para preview");
} catch (error) {
  console.error("Error inicializando Firebase:", error);
}

// Función para autenticación anónima
async function ensureAuth() {
  return new Promise((resolve, reject) => {
    const user = auth.currentUser;
    
    if (user) {
      console.log("Usuario ya autenticado:", user.uid);
      resolve(user);
      return;
    }
    
    console.log("Iniciando autenticación anónima para preview...");
    
    auth.signInAnonymously()
      .then((userCredential) => {
        console.log("Autenticación anónima exitosa:", userCredential.user.uid);
        resolve(userCredential.user);
      })
      .catch((error) => {
        console.error("Error en autenticación anónima:", error);
        reject(error);
      });
  });
}

// Cargar datos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log("Cargando vista previa...");
  cargarDatosPreview();
});

// Función para cargar datos desde Firestore
async function cargarDatosPreview() {
  const params = new URLSearchParams(window.location.search);
  const docId = params.get("id");
  
  console.log("ID del documento:", docId);

  if (!docId) {
    mostrarError("No se proporcionó un ID de documento válido.");
    return;
  }

  try {
    console.log("Autenticando para acceso a datos...");
    await ensureAuth();
    console.log("Autenticación exitosa, buscando documento...");
    
    const docRef = db.collection("historial-odontologia").doc(docId);
    const docSnap = await docRef.get();
    
    console.log("Documento existe:", docSnap.exists);

    if (docSnap.exists) {
      const docData = docSnap.data();
      console.log("Datos del documento:", docData);
      
      const processedData = {
        id: docSnap.id,
        ...docData,
        fechaCreacion: docData.createdAt ? 
          docData.createdAt.toDate().toLocaleString('es-MX') : 
          'No disponible'
      };
      
      renderPreview(processedData);
    } else {
      mostrarError("No se encontró el historial con el ID proporcionado.");
    }
  } catch (error) {
    console.error("Error al cargar datos:", error);
    mostrarError(`Error al cargar los datos: ${error.message}`);
  }
}

// Función para mostrar errores
function mostrarError(mensaje) {
  const contenido = document.getElementById("contenido");
  contenido.innerHTML = `
    <div class="preview-section">
      <div style="padding: 2rem; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">😕</div>
        <h3 style="color: #e63946; margin-bottom: 1rem;">Error</h3>
        <p style="margin-bottom: 2rem; color: #666;">${mensaje}</p>
      </div>
    </div>
  `;
}

// Función auxiliar para mostrar clave-valor
function kv(label, value) {
  if (value === undefined || value === null || value === "" || value === "undefined") {
    return '';
  }
  return `
    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px dashed #eee;">
      <strong style="min-width: 150px; color: #2a9d8f;">${label}:</strong>
      <span style="text-align: right;">${value}</span>
    </div>
  `;
}

// Función principal para renderizar la vista previa
function renderPreview(data) {
  console.log("Renderizando preview con datos:", data);

  // Leer costos, abonos, imágenes y odontograma
  const costos = Array.isArray(data.costos) ? data.costos : [];
  const abonos = Array.isArray(data.abonos) ? data.abonos : []; // <<< LEE LOS ABONOS
  const imagenes = Array.isArray(data.imagenesAdjuntas) ? data.imagenesAdjuntas : [];
  const odontograma = data.odontograma || {};

  // Leer totales guardados (si existen) o calcularlos SI NO EXISTEN
  // Intenta leer los totales guardados por modificar-odontologia.js
  const totalGeneral = data.totalGeneral ?? costos.reduce((sum, c) => sum + (Number(c.costo) || 0), 0);
  const totalAbonos = data.totalAbonos ?? abonos.reduce((sum, a) => sum + (Number(a.monto) || 0), 0); // <<< LEE/CALCULA TOTAL ABONOS (usa a.monto)
  const saldoPendiente = data.saldoPendiente ?? (totalGeneral - totalAbonos); // <<< LEE/CALCULA SALDO

  const html = `
    <div class="preview-section">
      <div style="background: #2a9d8f; color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; text-align: center;">
        <h1 style="margin: 0 0 0.5rem 0; color: white; font-size: 2rem;">Historia Clínica Odontológica</h1>
        <p style="margin: 0; opacity: 0.9; font-size: 1.1rem;">Paciente: <strong>${data.nombre || 'No especificado'}</strong></p>
        <p style="margin: 0; opacity: 0.9;">Fecha Creación: ${data.fechaCreacion || 'No disponible'}</p>
      </div>
    </div>

    <div class="preview-section">
      <h2 style="color: #2a9d8f; border-bottom: 2px solid #2a9d8f; padding-bottom: 0.5rem;">📋 Datos Generales</h2>
      <div class="preview-kv">
        ${kv("Nombre completo", data.nombre)}
        ${kv("Edad", data.edad)}
        ${kv("Sexo", data.sexo)}
        ${kv("Estado civil", data.estadoCivil)}
        ${kv("Correo electrónico", data.email)}
        ${kv("Teléfono", data.telefono)}
        ${kv("Ocupación", data.ocupacion)}
        ${kv("Dirección", data.direccion)}
        ${kv("Fecha de consulta", data.fecha)}
      </div>
    </div>

    <div class="preview-section">
      <h2 style="color: #2a9d8f; border-bottom: 2px solid #2a9d8f; padding-bottom: 0.5rem;">🏥 Antecedentes Médicos</h2>
      <div class="preview-kv">
        ${kv("Estado de salud", data.estadoSalud)}
        ${kv("Tratamiento médico", data.tratamiento)}
        ${kv("Medicamentos", data.medicamentos)}
        ${kv("Alergias", data.alergias)}
        ${kv("Operaciones previas", data.operaciones)}
        ${kv("Transfusiones", data.transfusiones)}
        ${kv("Enfermedades sistémicas", data.enfermedad)}
        ${kv("Enfermedades importantes", data.enfermedadImportante)}
        ${kv("Diabetes", data.diabetico)}
        ${kv("Hipertensión", data.hipertenso)}
        ${kv("Primera vez anestesia", data.primeraAnestesia)}
        ${kv("Problemas con anestesia", data.problemasAnestesia)}
        ${kv("Hábito de fumar", data.fuma)}
        ${kv("Consumo de drogas", data.drogas)}
        ${data.drogas === "Sí" ? kv("Tipo y frecuencia", `${data.tipoDrogas || "No especificado"} / ${data.frecuenciaDrogas || "No especificado"}`) : ""}
        ${kv("Embarazo", data.embarazo)}
        ${data.embarazo === "Sí" ? kv("Meses de embarazo", data.mesesEmbarazo) : ""}
      </div>
    </div>

    <div class="preview-section">
      <h2 style="color: #2a9d8f; border-bottom: 2px solid #2a9d8f; padding-bottom: 0.5rem;">🎯 Motivo de Consulta</h2>
      <div class="info-content">
        ${data.motivoConsulta ? data.motivoConsulta.replace(/\n/g, "<br>") : "No se registró motivo de consulta"}
      </div>
    </div>

    {/* --- SECCIÓN FINANCIERA CORREGIDA --- */}
    <div class="preview-section">
      <h2 style="color: #2a9d8f; border-bottom: 2px solid #2a9d8f; padding-bottom: 0.5rem;">💰 Información Financiera</h2>

      {/* Tabla de Cargos */}
      ${costos.length > 0 ? `
        <h3 style="margin-top: 1rem; color: #264653;">Cargos / Tratamientos</h3>
        <table class="costos-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Concepto</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody>
            ${costos.map(c => `
              <tr>
                <td>${c.fecha || "-"}</td>
                <td>${c.concepto || "-"}</td>
                <td>$${Number(c.costo || 0).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : '<p>No se registraron cargos.</p>'}

      {/* Tabla de Abonos <<< AÑADIDA >>> */}
      ${abonos.length > 0 ? `
        <h3 style="margin-top: 1rem; color: #264653;">Abonos / Pagos</h3>
        <table class="abonos-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Concepto/Método</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            ${abonos.map(a => `
              <tr>
                <td>${a.fecha || "-"}</td>
                <td>${a.concepto || "-"} (${a.metodo || 'N/A'})</td> {/* Muestra concepto y método */}
                <td>$${Number(a.monto || 0).toFixed(2)}</td> {/* Usa a.monto */}
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : '<p style="margin-top: 1rem;">No se registraron abonos.</p>'}

      {/* Resumen Financiero <<< CORREGIDO >>> */}
      <div class="resumen-financiero" style="margin-top: 1.5rem;">
        <h3 style="margin-bottom: 0.5rem;">Resumen</h3>
        <div class="preview-kv">
          ${kv("Total Cargos", `$${Number(totalGeneral).toFixed(2)}`)}
          ${kv("Total Abonos", `$${Number(totalAbonos).toFixed(2)}`)} {/* Muestra totalAbonos */}
          ${kv("Saldo Pendiente", `<strong style="color: ${saldoPendiente > 0 ? '#e63946' : '#2a9d8f'};">$${Number(saldoPendiente).toFixed(2)}</strong>`)} {/* Muestra saldoPendiente */}
        </div>
      </div>
    </div>
    {/* --- FIN SECCIÓN FINANCIERA --- */}

    <div class="preview-section">
      <h2 style="color: #2a9d8f; border-bottom: 2px solid #2a9d8f; padding-bottom: 0.5rem;">💊 Receta Médica</h2>
      <div class="info-content" style="white-space: pre-line;">
        ${data.receta || "No se recetaron medicamentos"}
      </div>
    </div>

    ${imagenes.length > 0 ? `
    <div class="preview-section no-imprimir">
      <h2 style="color: #2a9d8f; border-bottom: 2px solid #2a9d8f; padding-bottom: 0.5rem;">🖼️ Imágenes Adjuntas</h2>
      <div class="preview-images-grid">
        ${imagenes.map(u => `<a href="${u}" target="_blank" rel="noreferrer noopener"><img src="${u}" alt="Adjunto"></a>`).join("")}
      </div>
    </div>
    ` : ''}

    <div class="preview-section firmas">
      <div>
        <div class="firma-line"></div>
        <p style="font-weight: bold; color: #2a9d8f;">Firma del paciente</p>
        <p>${data.nombre || ''}</p>
      </div>

      <div>
        <div class="firma-line"></div>
        <p style="font-weight: bold; color: #2a9d8f;">Firma del odontólogo</p>
      </div>
    </div>

    <div class="preview-section aviso-privacidad">
      <h3 style="color: #2a9d8f;">🔒 Aviso de Privacidad</h3>
      <p>Sus datos personales serán utilizados únicamente con fines clínicos y administrativos conforme a la normativa aplicable. Para más información consulte el aviso completo en el consultorio.</p>
    </div>
  `;

  document.getElementById("contenido").innerHTML = html;
}

// Agregar estilos dinámicos con el color #2a9d8f
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
  .preview-container {
    max-width: 1000px;
    margin: 2rem auto;
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(42, 157, 143, 0.1);
  }

  .preview-section {
    margin-bottom: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    page-break-inside: avoid;
  }

  .preview-section h2 {
    color: #2a9d8f;
    border-bottom: 2px solid #2a9d8f;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  .info-content {
    background: #f0f5f9;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid #2a9d8f;
    margin: 0.5rem 0;
    font-size: 0.9rem;
  }

  .preview-kv {
    background: white;
    border-radius: 8px;
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  .costos-table {
    width: 100%;
    border-collapse: collapse;
    margin: 0.5rem 0;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(42, 157, 143, 0.1);
    font-size: 0.8rem;
  }

  .costos-table th {
    background: #2a9d8f;
    color: white;
    padding: 0.5rem;
    text-align: left;
    font-size: 0.9rem;
  }

  .costos-table td {
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
  }

  .costos-table tr:last-child td {
    border-bottom: none;
  }

  .total-row {
    background-color: #e8f5e9;
    font-weight: bold;
  }

  .firmas {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid #ddd;
    font-size: 0.9rem;
  }

  .firma-line {
    border-top: 2px solid #2a9d8f;
    width: 150px;
    margin: 0 auto 0.5rem;
    padding-top: 1.5rem;
  }

  .aviso-privacidad {
    background: #f0f5f9;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid #2a9d8f;
    margin-top: 1rem;
    font-size: 0.8rem;
  }

  .btn-print {
    background: #2a9d8f;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    margin: 0.5rem;
    transition: background 0.3s;
    font-size: 0.9rem;
  }
  .abonos-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  .abonos-table th,
  .abonos-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  .abonos-table th {
    background-color: #f2f2f2;
  }

  .abonos-table tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  .resumen-financiero {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-top: 20px;
    border-left: 4px solid #3498db;
  }

  .btn-print:hover {
    background: #21867a;
  }

  .btn-back {
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    margin: 0.5rem;
    transition: background 0.3s;
    font-size: 0.9rem;
  }

  .btn-back:hover {
    background: #5a6268;
  }

  .btn-cancel {
    background: #e63946;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    margin: 0.5rem;
    transition: background 0.3s;
    font-size: 0.9rem;
  }

  .btn-cancel:hover {
    background: #c53030;
  }

  .no-print {
    display: block;
  }

  @media print {
    .no-print {
      display: none !important;
    }
    .preview-container {
      box-shadow: none;
      margin: 0;
      padding: 0;
      max-width: 100%;
    }
    body {
      background: white !important;
      font-size: 12px;
    }
    .preview-section {
      border: none;
      padding: 0.5rem 0;
      margin-bottom: 0.5rem;
    }
    .preview-section h2 {
      font-size: 14px;
      margin-bottom: 0.5rem;
    }
    .info-content, .preview-kv {
      padding: 0.5rem;
      font-size: 11px;
    }
    .costos-table {
      font-size: 10px;
    }
    .costos-table th, .costos-table td {
      padding: 0.25rem;
    }
    .firmas {
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      font-size: 11px;
    }
    .firma-line {
      width: 120px;
      padding-top: 1rem;
    }
    .aviso-privacidad {
      margin-top: 0.5rem;
      padding: 0.5rem;
      font-size: 10px;
    }
    header {
      padding: 0.5rem;
    }
    header img {
      max-width: 100px;
    }
    header h1 {
      font-size: 1.5rem;
    }
    header h2 {
      font-size: 1rem;
    }
  }

  @media (max-width: 768px) {
    .preview-container {
      padding: 1rem;
      margin: 1rem;
    }
    .firmas {
      flex-direction: column;
      gap: 1rem;
    }
    .firma-line {
      width: 120px;
    }
    .btn-print, .btn-back, .btn-cancel {
      width: 100%;
      margin: 0.5rem 0;
    }
  }

  /* Animaciones */
  .preview-section {
    animation: fadeInUp 0.5s ease;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(dynamicStyles);