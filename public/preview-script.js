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
let db;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  console.log("Firebase inicializado correctamente para preview");
} catch (error) {
  console.error("Error inicializando Firebase:", error);
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
    console.log("Buscando documento en Firestore...");
    const docRef = db.collection("historial-odontologia").doc(docId);
    const docSnap = await docRef.get();
    
    console.log("Documento existe:", docSnap.exists);

    if (docSnap.exists) {
      const docData = docSnap.data();
      console.log("Datos del documento:", docData);
      
      // Preparar datos para mostrar
      const processedData = {
        id: docSnap.id,
        ...docData,
        // Convertir timestamps a formato legible
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
        <h3 style="color: #d32f2f; margin-bottom: 1rem;">Error</h3>
        <p style="margin-bottom: 2rem; color: #666;">${mensaje}</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button onclick="window.history.back()" class="btn-secondary">← Volver</button>
          <button onclick="window.location.href='add-odontologia.html'" class="btn-primary">Nueva Consulta</button>
        </div>
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
      <strong style="min-width: 150px;">${label}:</strong>
      <span style="text-align: right;">${value}</span>
    </div>
  `;
}

// Función principal para renderizar la vista previa
function renderPreview(data) {
  console.log("Renderizando preview con datos:", data);
  
  const costos = Array.isArray(data.costos) ? data.costos : [];

  const html = `
    <div class="preview-section">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
        <h1 style="margin: 0 0 0.5rem 0; color: white;">Historia Clínica Odontológica</h1>
        <p style="margin: 0; opacity: 0.9;">Paciente: <strong>${data.nombre || 'No especificado'}</strong></p>
        <p style="margin: 0; opacity: 0.9;">Fecha de creación: ${data.fechaCreacion || data.fecha || 'No disponible'}</p>
      </div>
    </div>

    <div class="preview-section">
      <h2>📋 Datos Generales del Paciente</h2>
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
      <h2>🏥 Antecedentes Médicos</h2>
      <div class="preview-kv">
        ${kv("Estado de salud general", data.estadoSalud)}
        ${kv("Tratamiento médico actual", data.tratamiento)}
        ${kv("Medicamentos", data.medicamentos)}
        ${kv("Alergias", data.alergias)}
        ${kv("Operaciones previas", data.operaciones)}
        ${kv("Transfusiones", data.transfusiones)}
        ${kv("Enfermedades sistémicas", data.enfermedad)}
        ${kv("Enfermedades importantes", data.enfermedadImportante)}
        ${kv("Diabetes", data.diabetico)}
        ${kv("Hipertensión", data.hipertenso)}
        ${kv("Primera vez con anestesia", data.primeraAnestesia)}
        ${kv("Problemas con anestesia", data.problemasAnestesia)}
        ${kv("Hábito de fumar", data.fuma)}
        ${kv("Consumo de drogas", data.drogas)}
        ${data.drogas === "Sí" ? kv("Tipo y frecuencia", `${data.tipoDrogas || "No especificado"} / ${data.frecuenciaDrogas || "No especificado"}`) : ""}
        ${kv("Embarazo", data.embarazo)}
        ${data.embarazo === "Sí" ? kv("Meses de embarazo", data.mesesEmbarazo) : ""}
      </div>
    </div>

    <div class="preview-section">
      <h2>🎯 Motivo de Consulta</h2>
      <div class="info-content" style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #667eea;">
        ${data.motivoConsulta ? data.motivoConsulta.replace(/\n/g, "<br>") : "No se registró motivo de consulta"}
      </div>
    </div>

    ${costos.length > 0 ? `
    <div class="preview-section">
      <h2>💰 Costos del Tratamiento</h2>
      <table class="odontologia-table" style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
        <thead>
          <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <th style="padding: 1rem; text-align: left;">Fecha</th>
            <th style="padding: 1rem; text-align: left;">Concepto</th>
            <th style="padding: 1rem; text-align: right;">Costo</th>
          </tr>
        </thead>
        <tbody>
          ${costos.map((costo, index) => `
            <tr style="${index % 2 === 0 ? 'background: #f8f9fa;' : 'background: white;'}">
              <td style="padding: 1rem; border-bottom: 1px solid #eee;">${costo.fecha || "No especificado"}</td>
              <td style="padding: 1rem; border-bottom: 1px solid #eee;">${costo.concepto || "No especificado"}</td>
              <td style="padding: 1rem; border-bottom: 1px solid #eee; text-align: right;">$${Number(costo.costo || 0).toFixed(2)}</td>
            </tr>
          `).join("")}
          <tr style="background: #e8f5e9; font-weight: bold;">
            <td colspan="2" style="padding: 1rem; text-align: right;">Total general:</td>
            <td style="padding: 1rem; text-align: right;">$${Number(data.totalGeneral || 0).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    ` : ''}

    <div class="preview-section">
      <h2>💊 Receta Médica</h2>
      <div class="info-content" style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #28a745; white-space: pre-line;">
        ${data.receta || "No se recetaron medicamentos"}
      </div>
    </div>

    <div class="preview-section firmas" style="display: flex; justify-content: space-between; margin-top: 3rem; padding-top: 2rem; border-top: 2px solid #ddd;">
      <div style="text-align: center;">
        <div style="border-top: 2px solid #333; width: 250px; margin: 0 auto 1rem; padding-top: 2rem;"></div>
        <p style="font-weight: bold; margin: 0;">Firma del paciente</p>
        <p style="margin: 0.5rem 0 0; color: #666;">${data.nombre || ''}</p>
      </div>
      
      <div style="text-align: center;">
        <div style="border-top: 2px solid #333; width: 250px; margin: 0 auto 1rem; padding-top: 2rem;"></div>
        <p style="font-weight: bold; margin: 0;">Firma del odontólogo</p>
        <p style="margin: 0.5rem 0 0; color: #666;">Dr. Beladent</p>
      </div>
    </div>

    <div class="preview-section" style="margin-top: 3rem; padding: 1.5rem; background: #f8f9fa; border-radius: 8px;">
      <h2>🔒 Aviso de Privacidad</h2>
      <p>Sus datos personales serán utilizados únicamente con fines clínicos y administrativos conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares. Los datos recabados serán protegidos y no se compartirán con terceros sin su consentimiento explícito.</p>
      <p style="margin-top: 1rem; font-style: italic;">
        "Yo, ${data.nombre || "el paciente"}, confirmo que he leído y entendido este aviso de privacidad y doy mi consentimiento para el tratamiento de mis datos personales."
      </p>
    </div>

    <div class="no-print" style="margin-top: 2rem; text-align: center;">
      <button onclick="window.print()" class="btn-primary">🖨️ Imprimir documento</button>
    </div>
  `;

  document.getElementById("contenido").innerHTML = html;
}

// Agregar estilos dinámicos para mejor apariencia
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
  .preview-container {
    max-width: 1000px;
    margin: 2rem auto;
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #667eea;
  }

  .preview-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .preview-kv {
    background: white;
    border-radius: 8px;
    padding: 1rem;
  }

  .info-content {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    border-left: 4px solid #667eea;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: transform 0.2s;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
  }

  .btn-secondary:hover {
    background: #5a6268;
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
    }
    body {
      background: white !important;
    }
  }

  @media (max-width: 768px) {
    .preview-container {
      padding: 1rem;
      margin: 1rem;
    }
    .preview-header {
      flex-direction: column;
      gap: 1rem;
    }
    .firmas {
      flex-direction: column;
      gap: 2rem;
    }
  }
`;
document.head.appendChild(dynamicStyles);