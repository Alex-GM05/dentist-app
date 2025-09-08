// --- Firebase init ---
const firebaseConfig = {
  apiKey: "AIzaSyAmuMId-e9LiO0cxadGRtxYBK9Tqi2khdI",
  authDomain: "dentist-app-2bb07.firebaseapp.com",
  projectId: "dentist-app-2bb07",
  storageBucket: "dentist-app-2bb07.firebasestorage.app",
  messagingSenderId: "410183687912",
  appId: "1:410183687912:web:43ee87e4a9122edb74b35d"
};

// Inicializar Firebase
let db, storage, auth;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  storage = firebase.storage();
  auth = firebase.auth();
  console.log("Firebase inicializado correctamente");
} catch (error) {
  console.error("Error inicializando Firebase:", error);
}

// Función mejorada para autenticación anónima
async function ensureAuth() {
  return new Promise((resolve, reject) => {
    const user = auth.currentUser;
    
    if (user) {
      console.log("Usuario ya autenticado:", user.uid);
      resolve(user);
      return;
    }
    
    // Forzar autenticación anónima
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

// --- Generar odontograma (OD NO editable) ---
function generarOdontograma() {
  const tbody = document.querySelector("#tablaOdontograma tbody");
  if (!tbody) return;
  
  // Dientes superiores (18 a 28)
  const dientesSuperiores = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  
  // Dientes inferiores (48 a 38)
  const dientesInferiores = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
  
  // Crear filas para dientes superiores
  for (let i = 0; i < 8; i++) {
    const tr = document.createElement('tr');
    
    // Lado izquierdo (OD, DX, TX)
    for (let j = 0; j < 3; j++) {
      const td = document.createElement('td');
      
      if (j === 0) {
        // OD - Solo texto (no editable)
        td.innerHTML = `<div class="tooth-od">${dientesSuperiores[i]}</div>`;
        td.style.backgroundColor = "#f0f0f0";
        td.style.fontWeight = "bold";
      } else {
        // DX y TX - Editables
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'tooth-input';
        input.name = `diente_${dientesSuperiores[i]}_${['OD', 'DX', 'TX'][j]}`;
        input.placeholder = `${['OD', 'DX', 'TX'][j]}`;
        td.appendChild(input);
      }
      
      tr.appendChild(td);
    }
    
    // Lado derecho (OD, DX, TX)
    for (let j = 0; j < 3; j++) {
      const td = document.createElement('td');
      
      if (j === 0) {
        // OD - Solo texto (no editable)
        td.innerHTML = `<div class="tooth-od">${dientesSuperiores[i+8]}</div>`;
        td.style.backgroundColor = "#f0f0f0";
        td.style.fontWeight = "bold";
      } else {
        // DX y TX - Editables
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'tooth-input';
        input.name = `diente_${dientesSuperiores[i+8]}_${['OD', 'DX', 'TX'][j]}`;
        input.placeholder = `${['OD', 'DX', 'TX'][j]}`;
        td.appendChild(input);
      }
      
      tr.appendChild(td);
    }
    
    tbody.appendChild(tr);
  }
  
  // Separador entre arcadas
  const separator = document.createElement('tr');
  separator.innerHTML = '<td colspan="6" style="background-color: #f0f0f0; text-align: center; font-weight: bold;">Arcada Inferior</td>';
  tbody.appendChild(separator);
  
  // Crear filas para dientes inferiores
  for (let i = 0; i < 8; i++) {
    const tr = document.createElement('tr');
    
    // Lado izquierdo (OD, DX, TX)
    for (let j = 0; j < 3; j++) {
      const td = document.createElement('td');
      
      if (j === 0) {
        // OD - Solo texto (no editable)
        td.innerHTML = `<div class="tooth-od">${dientesInferiores[i]}</div>`;
        td.style.backgroundColor = "#f0f0f0";
        td.style.fontWeight = "bold";
      } else {
        // DX y TX - Editables
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'tooth-input';
        input.name = `diente_${dientesInferiores[i]}_${['OD', 'DX', 'TX'][j]}`;
        input.placeholder = `${['OD', 'DX', 'TX'][j]}`;
        td.appendChild(input);
      }
      
      tr.appendChild(td);
    }
    
    // Lado derecho (OD, DX, TX)
    for (let j = 0; j < 3; j++) {
      const td = document.createElement('td');
      
      if (j === 0) {
        // OD - Solo texto (no editable)
        td.innerHTML = `<div class="tooth-od">${dientesInferiores[i+8]}</div>`;
        td.style.backgroundColor = "#f0f0f0";
        td.style.fontWeight = "bold";
      } else {
        // DX y TX - Editables
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'tooth-input';
        input.name = `diente_${dientesInferiores[i+8]}_${['OD', 'DX', 'TX'][j]}`;
        input.placeholder = `${['OD', 'DX', 'TX'][j]}`;
        td.appendChild(input);
      }
      
      tr.appendChild(td);
    }
    
    tbody.appendChild(tr);
  }
}

// --- Condicionales ---
function setupConditionals() {
  const embarazoSelect = document.getElementById("embarazo");
  const drogasSelect = document.getElementById("drogas");
  
  if (embarazoSelect) {
    embarazoSelect.addEventListener("change", function() {
      const embarazoExtra = document.getElementById("embarazoExtra");
      if (embarazoExtra) {
        embarazoExtra.style.display = this.value === "Sí" ? "block" : "none";
      }
    });
  }
  
  if (drogasSelect) {
    drogasSelect.addEventListener("change", function() {
      const drogasExtra = document.getElementById("drogasExtra");
      if (drogasExtra) {
        drogasExtra.style.display = this.value === "Sí" ? "block" : "none";
      }
    });
  }
}

// --- Costos dinámicos (MODIFICADO) ---
function setupCostos() {
  const tbodyCostos = document.querySelector("#tablaCostos tbody");
  if (!tbodyCostos) return;
  
  window.agregarFilaCosto = function(fecha = new Date().toISOString().split('T')[0], concepto = "", costo = 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="date" name="fechaCosto" value="${fecha}" required></td>
      <td><input type="text" name="conceptoCosto" value="${concepto}" placeholder="Descripción del servicio" required></td>
      <td><input type="number" name="costoCosto" value="${costo}" min="0" step="0.01" required></td>
      <td><button type="button" onclick="eliminarFilaCosto(this)">❌</button></td>
    `;
    tbodyCostos.appendChild(tr);
    
    // listeners para recalcular total
    tr.querySelectorAll("input[name='costoCosto']").forEach(inp => {
      inp.addEventListener("input", calcularGranTotal);
    });
    
    calcularGranTotal();
  };
  
  window.eliminarFilaCosto = function(btn) {
    btn.closest("tr").remove();
    calcularGranTotal();
  };
  
  window.calcularGranTotal = function() {
    let total = 0;
    document.querySelectorAll("input[name='costoCosto']").forEach(input => {
      total += parseFloat(input.value) || 0;
    });
    const granTotalElement = document.getElementById("granTotal");
    if (granTotalElement) {
      granTotalElement.textContent = total.toFixed(2);
    }
  };
  
  window.limpiarCostos = function() {
    if (confirm("¿Estás seguro de que quieres eliminar todos los conceptos de costos?")) {
      tbodyCostos.innerHTML = "";
      calcularGranTotal();
    }
  };
  
  // Arrancamos con una fila
  agregarFilaCosto();
}

// --- Previsualización local de imágenes ---
function setupImagePreview() {
  const inputImgs = document.getElementById("imagenes");
  const previewCont = document.getElementById("previewImagenes");
  
  if (inputImgs && previewCont) {
    inputImgs.addEventListener("change", () => {
      previewCont.innerHTML = "";
      [...inputImgs.files].forEach(file => {
        const url = URL.createObjectURL(file);
        const div = document.createElement("div");
        div.className = "thumb";
        div.innerHTML = `<img src="${url}" alt=""><p>${file.name}</p>`;
        previewCont.appendChild(div);
      });
    });
  }
}

// Función MEJORADA para subir imágenes a Firebase Storage
async function subirImagenes(docId, files) {
  const urls = [];
  
  console.log(`Intentando subir ${files.length} imágenes...`);
  
  // Asegurar autenticación antes de subir
  try {
    await ensureAuth();
    console.log("Autenticación verificada para subida de imágenes");
  } catch (error) {
    console.error("Error en autenticación para subida:", error);
    throw new Error("No se pudo autenticar para subir imágenes");
  }
  
  for (const file of files) {
    try {
      // Validación simple (5 MB)
      if (file.size > 5 * 1024 * 1024) {
        console.warn(`El archivo ${file.name} excede 5 MB. No se subirá.`);
        continue;
      }
      
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const path = `historial-odontologia/${docId}/adjuntos/${fileName}`;
      const storageRef = storage.ref(path);
      
      console.log(`Subiendo imagen: ${fileName} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      
      // Mostrar progreso de subida
      const progressElement = document.createElement('div');
      progressElement.innerHTML = `<p>Subiendo ${file.name}... <span class="upload-progress">0%</span></p>`;
      document.getElementById('previewImagenes').appendChild(progressElement);
      
      // Subir el archivo con metadata y seguimiento de progreso
      const uploadTask = storageRef.put(file, {
        contentType: file.type,
        customMetadata: {
          'uploadedBy': 'anonymous',
          'uploadedAt': new Date().toISOString(),
          'originalName': file.name
        }
      });
      
      // Monitorizar progreso
      uploadTask.on('state_changed',
        (snapshot) => {
          // Progreso de la subida
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressElement.querySelector('.upload-progress').textContent = Math.round(progress) + '%';
          console.log(`Progreso de ${file.name}: ${progress}%`);
        },
        (error) => {
          // Manejar errores
          console.error(`Error subiendo ${file.name}:`, error);
          progressElement.innerHTML = `<p style="color: red;">Error subiendo ${file.name}</p>`;
        },
        async () => {
          // Subida completada
          try {
            const url = await uploadTask.snapshot.ref.getDownloadURL();
            console.log(`Imagen subida exitosamente: ${fileName}`);
            console.log(`URL obtenida: ${url}`);
            
            urls.push(url);
            progressElement.innerHTML = `<p style="color: green;">✓ ${file.name} subido correctamente</p>`;
            
          } catch (urlError) {
            console.error(`Error obteniendo URL para ${file.name}:`, urlError);
            progressElement.innerHTML = `<p style="color: orange;">✓ ${file.name} subido pero error obteniendo URL</p>`;
          }
        }
      );
      
      // Esperar a que termine esta subida antes de continuar
      await uploadTask;
      
    } catch (error) {
      console.error(`Error en el proceso de subida para ${file.name}:`, error);
      // Continuamos con las demás imágenes
    }
  }
  
  console.log(`Subida completada. ${urls.length} imágenes subidas correctamente.`);
  return urls;
}

// --- Guardar en Firestore + Storage (VERSIÓN MEJORADA) ---
function setupFormSubmission() {
  const form = document.getElementById("odontologiaForm");
  if (!form) return;
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Mostrar indicador de carga
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = "Guardando...";
    submitButton.disabled = true;

    // Agregar mensaje de estado
    const statusDiv = document.createElement('div');
    statusDiv.id = 'upload-status';
    statusDiv.style.padding = '1rem';
    statusDiv.style.margin = '1rem 0';
    statusDiv.style.borderRadius = '8px';
    statusDiv.style.backgroundColor = '#f8f9fa';
    form.appendChild(statusDiv);

    try {
      console.log("Iniciando proceso de guardado...");
      updateStatus("Iniciando proceso de guardado...", "info");
      
      // Asegurar autenticación AL INICIO del proceso
      updateStatus("Autenticando...", "info");
      await ensureAuth();
      console.log("Usuario autenticado");
      updateStatus("Autenticación exitosa", "success");

      // *** CORRECCIÓN: Declarar e inicializar la variable data ***
      const data = {};
      new FormData(form).forEach((v, k) => data[k] = v);

      // Validación mínima (AHORA SÍ data está definida)
      if (!data.email) {
        alert("Captura el correo del paciente.");
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        return;
      }

      // Recopilar datos del odontograma (solo DX y TX)
      data.odontograma = {};
      document.querySelectorAll(".tooth-input").forEach(input => {
        if (input.value.trim() !== "") {
          data.odontograma[input.name] = input.value;
        }
      });
      data.observacionesOdontograma = data.observacionesOdontograma || "";

      // Costos
      const costos = [];
      document.querySelectorAll("#tablaCostos tbody tr").forEach(tr => {
        costos.push({
          fecha: tr.querySelector("[name='fechaCosto']").value,
          concepto: tr.querySelector("[name='conceptoCosto']").value,
          costo: parseFloat(tr.querySelector("[name='costoCosto']").value) || 0
        });
      });
      data.costos = costos;
      data.totalGeneral = parseFloat(document.getElementById("granTotal").textContent) || 0;

      // Metadatos
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

      // 1) Guardar documento primero (sin imágenes) para obtener docId
      updateStatus("Guardando datos principales...", "info");
      const docRef = await db.collection("historial-odontologia").add(data);
      console.log("Datos guardados correctamente con ID:", docRef.id);
      updateStatus("Datos principales guardados", "success");

      // 2) Subir imágenes si las hay
      const inputImgs = document.getElementById("imagenes");
      const files = inputImgs.files ? [...inputImgs.files] : [];
      
      if (files.length > 0) {
        try {
          updateStatus(`Subiendo ${files.length} imágenes...`, "info");
          const imageUrls = await subirImagenes(docRef.id, files);
          
          if (imageUrls.length > 0) {
            // Actualizar documento con URLs de imágenes
            updateStatus("Actualizando documento con imágenes...", "info");
            await docRef.update({ 
              imagenesAdjuntas: imageUrls,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp() 
            });
            updateStatus("Imágenes subidas correctamente", "success");
          } else {
            updateStatus("No se subieron imágenes (posiblemente por errores)", "warning");
          }
        } catch (error) {
          console.error("Error en el proceso de imágenes:", error);
          updateStatus("Error subiendo imágenes, pero los datos se guardaron", "error");
          // Continuamos aunque haya error en imágenes
        }
      } else {
        console.log("No hay imágenes para subir");
        updateStatus("No hay imágenes para subir", "info");
      }

      // 3) Ir al preview después de un breve delay
      updateStatus("Redirigiendo a vista previa...", "success");
      setTimeout(() => {
        window.location.href = `preview-odontologia.html?id=${docRef.id}`;
      }, 2000);

    } catch (error) {
      console.error("Error en el proceso de guardado:", error);
      updateStatus("Error al guardar: " + error.message, "error");
      alert("Ocurrió un error al guardar. Por favor, revisa la consola para más detalles.");
      
      // Restaurar botón
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  });

  // Función auxiliar para actualizar el estado
  function updateStatus(message, type) {
    const statusDiv = document.getElementById('upload-status');
    if (!statusDiv) return;
    
    const colors = {
      info: '#e3f2fd',
      success: '#e8f5e9',
      warning: '#fff3e0',
      error: '#ffebee'
    };
    
    const textColors = {
      info: '#1565c0',
      success: '#2e7d32',
      warning: '#f57c00',
      error: '#c62828'
    };
    
    statusDiv.style.backgroundColor = colors[type] || '#f8f9fa';
    statusDiv.style.color = textColors[type] || '#333';
    statusDiv.innerHTML = `<p><strong>Estado:</strong> ${message}</p>`;
    
    console.log(`Estado: ${message}`);
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
  
  html += `</tbody></table>`;
  
  return html;
}

// --- Funciones para la página de preview ---
async function cargarDatosPreview() {
  const params = new URLSearchParams(location.search);
  const docId = params.get("id");
  const email = params.get("email");

  let docData = null;

  try {
    if (docId) {
      const snap = await db.collection("historial-odontologia").doc(docId).get();
      if (snap.exists) docData = { id: snap.id, ...snap.data() };
    } else if (email) {
      const q = await db.collection("historial-odontologia")
                        .where("email", "==", email)
                        .orderBy("createdAt", "desc")
                        .limit(1)
                        .get();
      if (!q.empty) docData = { id: q.docs[0].id, ...q.docs[0].data() };
    }
  } catch (err) {
    console.error("Error consultando:", err);
  }

  if (!docData) {
    document.getElementById("contenido").innerHTML =
      "<p>No se encontró el historial solicitado.</p>";
    return;
  }

  renderPreview(docData);
}

function kv(label, value) {
  return `<div><strong>${label}</strong></div><div>${value ?? "-"}</div>`;
}

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
        ${kv("Importante", data.enfermedadImportante)}
        ${kv("Diabético", data.diabetico)}
        ${kv("Hipertenso", data.hipertenso)}
        ${kv("Primera vez anestesia", data.primeraAnestesia)}
        ${kv("Problemas anestesia", data.problemasAnestesia)}
        ${kv("Fuma", data.fuma)}
        ${kv("Drogas", data.drogas)}
        ${data.drogas === "Sí" ? kv("Tipo/Frecuencia", `${data.tipoDrogas ?? "-"} / ${data.frecuenciaDrogas ?? "-"}`) : ""}
        ${kv("Embarazo", data.embarazo)}
        ${data.embarazo === "Sí" ? kv("Meses embarazo", data.mesesEmbarazo) : ""}
      </div>
    </div>

    <div class="preview-section">
      <h2>Motivo de consulta</h2>
      <div>${(data.motivoConsulta || "").replace(/\n/g, "<br>") || "-"}</div>
    </div>

    <div class="preview-section">
      <h2>Odontograma</h2>
      <div class="preview-odontograma">
        ${generarOdontogramaPreview(odontograma)}
        ${data.observacionesOdontograma ? `<p><strong>Observaciones:</strong> ${data.observacionesOdontograma}</p>` : ''}
      </div>
    </div>

    <div class="preview-section">
      <h2>Costos</h2>
      ${
        costos.length
          ? `
          <table class="odontologia-table">
            <thead>
              <tr><th>Fecha</th><th>Concepto</th><th>Costo</th></tr>
            </thead>
            <tbody>
              ${costos.map(c=>`
                <tr>
                  <td>${c.fecha ?? "-"}</td>
                  <td>${c.concepto ?? "-"}</td>
                  <td>$${Number(c.costo ?? 0).toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <h3 style="margin-top:.5rem;">Total general: $${Number(data.totalGeneral ?? 0).toFixed(2)}</h3>
          `
          : "<p>No se capturaron costos.</p>"
      }
    </div>

    <div class="preview-section">
      <h2>Receta</h2>
      <div>${(data.receta || "").replace(/\n/g, "<br>") || "-"}</div>
    </div>

    <div class="preview-section no-imprimir">
      <h2>Imágenes adjuntas</h2>
      ${
        imagenes.length
          ? `<div class="preview-images-grid">
              ${imagenes.map(u=>`<a href="${u}" target="_blank" rel="noreferrer noopener"><img src="${u}" alt="Adjunto"></a>`).join("")}
             </div>`
          : "<p>No hay imágenes adjuntas.</p>"
      }
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

    <div class="preview-section">
      <h3>Aviso de privacidad</h3>
      <p>Sus datos personales serán utilizados únicamente con fines clínicos y administrativos conforme a la normativa aplicable. Para más información consulte el aviso completo en el consultorio.</p>
    </div>
  `;

  document.getElementById("contenido").innerHTML = html;
}

// --- Inicialización cuando el DOM esté listo ---
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM cargado, inicializando...");
  
  // Autenticar inmediatamente al cargar la página
  ensureAuth().catch(error => {
    console.error("Error en autenticación inicial:", error);
  });
  
  // Solo ejecutar estas funciones si estamos en la página de agregar odontología
  if (document.getElementById('odontologiaForm')) {
    console.log("Inicializando formulario de odontología...");
    generarOdontograma();
    setupConditionals();
    setupCostos();
    setupImagePreview();
    setupFormSubmission();
  }
  
  // Si estamos en la página de preview, cargar los datos
  if (document.getElementById('contenido')) {
    console.log("Inicializando página de preview...");
    cargarDatosPreview();
  }
});