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
  let db, storage;
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    storage = firebase.storage();
    console.log("Firebase inicializado correctamente");
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
    const params = new URLSearchParams(location.search);
    const docId = params.get("id");
    
    console.log("ID del documento:", docId);
  
    if (!docId) {
      mostrarError("No se proporcionó un ID de documento válido.");
      return;
    }
  
    let docData = null;
  
    try {
      const snap = await db.collection("historial-odontologia").doc(docId).get();
      console.log("Documento encontrado:", snap.exists);
      
      if (snap.exists) {
        docData = { 
          id: snap.id, 
          ...snap.data(),
          // Convertir timestamps a fechas legibles
          fechaCreacion: snap.data().createdAt ? snap.data().createdAt.toDate().toLocaleString() : 'No disponible'
        };
        console.log("Datos del documento:", docData);
      } else {
        mostrarError("No se encontró el historial con el ID proporcionado.");
        return;
      }
    } catch (err) {
      console.error("Error consultando:", err);
      mostrarError("Error al cargar los datos. Por favor, intenta nuevamente.");
      return;
    }
  
    renderPreview(docData);
  }
  
  // Función para mostrar errores
  function mostrarError(mensaje) {
    document.getElementById("contenido").innerHTML = `
      <div class="preview-section">
        <div style="padding: 1rem; background: #ffebee; border-radius: 8px; color: #c62828; margin: 1rem 0;">
          <strong>Error:</strong> ${mensaje}
        </div>
        <button onclick="window.location.href='add-odontologia.html'" class="btn-secondary">
          ← Volver al formulario
        </button>
      </div>
    `;
  }
  
  // Función auxiliar para mostrar clave-valor
  function kv(label, value) {
    if (value === undefined || value === null || value === "") return '';
    return `<div><strong>${label}</strong></div><div>${value}</div>`;
  }
  
  // Función para generar el odontograma en vista previa
  function generarOdontogramaPreview(odontogramaData) {
    if (!odontogramaData || Object.keys(odontogramaData).length === 0) {
      return "<div class='info-content'>No hay datos del odontograma.</div>";
    }
    
    let html = `
      <div class="odontograma-wrap">
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
          html += `<td style="background-color: #f0f0f0; font-weight: bold;">${dientesSuperiores[i+8]}</td>`;
        } else {
          // DX y TX - Mostrar datos
          const key = `diente_${dientesSuperiores[i+8]}_${['OD', 'DX', 'TX'][j]}`;
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
          html += `<td style="background-color: #f0f0f0; font-weight: bold;">${dientesInferiores[i+8]}</td>`;
        } else {
          // DX y TX - Mostrar datos
          const key = `diente_${dientesInferiores[i+8]}_${['OD', 'DX', 'TX'][j]}`;
          html += `<td>${odontogramaData[key] || "-"}</td>`;
        }
      }
      
      html += '</tr>';
    }
    
    html += `</tbody></table></div>`;
    
    return html;
  }
  
  // Función principal para renderizar la vista previa
  function renderPreview(data) {
    const costos = Array.isArray(data.costos) ? data.costos : [];
    const imagenes = Array.isArray(data.imagenesAdjuntas) ? data.imagenesAdjuntas : [];
    const odontograma = data.odontograma || {};
  
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
          ${kv("Fecha de consulta", data.fecha)}
          ${kv("Fecha de creación", data.fechaCreacion)}
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
        <h2>Odontograma</h2>
        ${generarOdontogramaPreview(odontograma)}
        ${data.observacionesOdontograma ? `
          <div class="info-content" style="margin-top: 1rem;">
            <strong>Observaciones:</strong> ${data.observacionesOdontograma}
          </div>
        ` : ''}
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
  
      ${
        imagenes.length > 0
          ? `
          <div class="preview-section no-imprimir">
            <h2>Imágenes adjuntas</h2>
            <div class="preview-images-grid">
              ${imagenes.map(url => `
                <div class="thumb">
                  <a href="${url}" target="_blank" rel="noopener noreferrer">
                    <img src="${url}" alt="Imagen clínica" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjM1ZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPkltYWdlbiBubyBlbmNvbnRyYWRhPC90ZXh0Pjwvc3ZnPg=='">
                  </a>
                </div>
              `).join('')}
            </div>
          </div>
          `
          : ''
      }
  
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