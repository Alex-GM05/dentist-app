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
    console.log("Firebase inicializado correctamente");
  } catch (error) {
    console.error("Error inicializando Firebase:", error);
  }
  
  // Cargar datos cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', function() {
    cargarDatosPreview();
  });
  
  // Función para cargar datos desde Firestore
  async function cargarDatosPreview() {
    const params = new URLSearchParams(location.search);
    const docId = params.get("id");
  
    let docData = null;
  
    try {
      if (docId) {
        const snap = await db.collection("historial-odontologia").doc(docId).get();
        if (snap.exists) docData = { id: snap.id, ...snap.data() };
      }
    } catch (err) {
      console.error("Error consultando:", err);
      mostrarError("Error al cargar los datos. Por favor, intenta nuevamente.");
    }
  
    if (!docData) {
      mostrarError("No se encontró el historial solicitado.");
      return;
    }
  
    renderPreview(docData);
  }
  
  // Función para mostrar errores
  function mostrarError(mensaje) {
    document.getElementById("contenido").innerHTML = `
      <div class="preview-section">
        <div style="padding: 1rem; background: #ffebee; border-radius: 8px; color: #c62828;">
          <strong>Error:</strong> ${mensaje}
        </div>
      </div>
    `;
  }
  
  // Función auxiliar para mostrar clave-valor
  function kv(label, value) {
    if (!value || value === "-") return '';
    return `<div><strong>${label}</strong></div><div>${value}</div>`;
  }
  
  // Función principal para renderizar la vista previa
  function renderPreview(data) {
    const costos = Array.isArray(data.costos) ? data.costos : [];
  
    const html = `
      <div class="preview-section">
        <h2>Datos Generales</h2>
        <div class="preview-kv">
          ${kv("Nombre", data.nombre)}
          ${kv("Edad", data.edad)}
          ${kv("Sexo", data.sexo)}
          ${kv("Estado civil", data.estadoCivil)}
          ${kv("Correo", data.email)}
          ${kv("Teléfono", data.telefono)}
          ${kv("Ocupación", data.ocupacion)}
          ${kv("Dirección", data.direccion)}
          ${kv("Fecha", data.fecha)}
        </div>
      </div>
  
      <div class="preview-section">
        <h2>Antecedentes</h2>
        <div class="preview-kv">
          ${kv("Estado de salud", data.estadoSalud)}
          ${kv("Tratamiento médico", data.tratamiento)}
          ${kv("Medicamentos", data.medicamentos)}
          ${kv("Alergias", data.alergias)}
          ${kv("Operaciones", data.operaciones)}
          ${kv("Transfusiones", data.transfusiones)}
          ${kv("Enf. sistémica", data.enfermedad)}
          ${kv("Enfermedad importante", data.enfermedadImportante)}
          ${kv("Diabético", data.diabetico)}
          ${kv("Hipertenso", data.hipertenso)}
          ${kv("Primera vez anestesia", data.primeraAnestesia)}
          ${kv("Problemas anestesia", data.problemasAnestesia)}
          ${kv("Fuma", data.fuma)}
          ${kv("Drogas", data.drogas)}
          ${data.drogas === "Sí" ? kv("Tipo/Frecuencia", `${data.tipoDrogas || "-"} / ${data.frecuenciaDrogas || "-"}`) : ""}
          ${kv("Embarazo", data.embarazo)}
          ${data.embarazo === "Sí" ? kv("Meses embarazo", data.mesesEmbarazo) : ""}
        </div>
      </div>
  
      <div class="preview-section">
        <h2>Motivo de consulta</h2>
        <div class="info-content">
          ${(data.motivoConsulta || "No se registró motivo de consulta").replace(/\n/g, "<br>")}
        </div>
      </div>
  
      <div class="preview-section">
        <h2>Costos</h2>
        ${
          costos.length
            ? `
            <table class="odontologia-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Concepto</th>
                  <th>Costo</th>
                </tr>
              </thead>
              <tbody>
                ${costos.map(c=>`
                  <tr>
                    <td>${c.fecha || "-"}</td>
                    <td>${c.concepto || "-"}</td>
                    <td>$${Number(c.costo || 0).toFixed(2)}</td>
                  </tr>
                `).join("")}
                <tr class="total-row">
                  <td colspan="2" class="text-right"><strong>Total general:</strong></td>
                  <td><strong>$${Number(data.totalGeneral || 0).toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
            `
            : "<div class='info-content'>No se capturaron costos.</div>"
        }
      </div>
  
      <div class="preview-section">
        <h2>Receta</h2>
        <div class="info-content" style="white-space: pre-line;">
          ${data.receta || "No se recetaron medicamentos"}
        </div>
      </div>
  
      <div class="preview-section firmas">
        <div>
          <p>__________________________</p>
          <p>Firma del paciente</p>
        </div>
        <div>
          <p>__________________________</p>
          <p>Firma del odontólogo</p>
        </div>
      </div>
  
      <div class="aviso-privacidad">
        <h3>Aviso de privacidad</h3>
        <p>Sus datos personales serán utilizados únicamente con fines clínicos y administrativos conforme a la normativa aplicable. Para más información consulte el aviso completo en el consultorio.</p>
        <p class="consentimiento">
          Yo, ${data.nombre || "el paciente"}, confirmo que he leído y entendido este aviso de privacidad y doy mi consentimiento para el tratamiento de mis datos personales.
        </p>
      </div>
    `;
  
    document.getElementById("contenido").innerHTML = html;
  }