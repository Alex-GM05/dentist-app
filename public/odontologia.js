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

// Función mejorada para autenticación
async function ensureAuth() {
  return new Promise((resolve, reject) => {
    const user = auth.currentUser;
    
    // Si ya hay un usuario autenticado (email o anónimo)
    if (user) {
      console.log("Usuario ya autenticado:", user.uid, "Anónimo:", user.isAnonymous);
      resolve(user);
      return;
    }
    
    console.log("Iniciando autenticación anónima...");
    
    // Timeout para evitar bloqueos infinitos
    const authTimeout = setTimeout(() => {
      reject(new Error("Timeout en autenticación anónima"));
    }, 10000);
    
    // Intentar autenticación anónima
    auth.signInAnonymously()
      .then((userCredential) => {
        clearTimeout(authTimeout);
        console.log("Autenticación anónima exitosa:", userCredential.user.uid);
        resolve(userCredential.user);
      })
      .catch((error) => {
        clearTimeout(authTimeout);
        console.error("Error en autenticación anónima:", error);
        
        // Si falla la autenticación anónima, intentar con el usuario actual del login
        const currentUser = auth.currentUser;
        if (currentUser) {
          console.log("Usando usuario existente:", currentUser.uid);
          resolve(currentUser);
        } else {
          reject(error);
        }
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

// --- Función MEJORADA para subir imágenes ---
async function subirImagenes(docId, files) {
  const urls = [];
  
  console.log(`Intentando subir ${files.length} imágenes para documento: ${docId}`);
  
  if (!files || files.length === 0) {
    console.log("No hay imágenes para subir");
    return urls;
  }

  try {
    // Asegurar autenticación
    const user = await ensureAuth();
    console.log("Usuario autenticado para subida:", user.uid, "Anónimo:", user.isAnonymous);
    
    // Crear contenedor para progreso
    let progressContainer = document.getElementById('upload-progress-container');
    if (!progressContainer) {
      progressContainer = document.createElement('div');
      progressContainer.id = 'upload-progress-container';
      progressContainer.style.marginTop = '1rem';
      progressContainer.style.padding = '1rem';
      progressContainer.style.background = '#f8f9fa';
      progressContainer.style.borderRadius = '8px';
      progressContainer.style.border = '1px solid #ddd';
      const form = document.getElementById('odontologiaForm');
      if (form) {
        form.appendChild(progressContainer);
      }
    }

    for (const file of files) {
      try {
        // Validación de tamaño
        if (file.size > 5 * 1024 * 1024) {
          console.warn(`El archivo ${file.name} excede 5 MB. No se subirá.`);
          continue;
        }
        
        // Nombre único para el archivo
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const path = `historial-odontologia/${docId}/adjuntos/${fileName}`;
        const storageRef = storage.ref(path);
        
        console.log(`Subiendo: ${file.name} -> ${path}`);

        // Mostrar progreso
        const progressElement = document.createElement('div');
        progressElement.className = 'upload-progress-item';
        progressElement.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="flex: 1; font-size: 0.9rem;">${file.name}</span>
            <span class="upload-progress" style="margin: 0 10px; font-weight: bold;">0%</span>
            <span class="upload-status">⏳</span>
          </div>
          <div style="height: 4px; background: #e0e0e0; border-radius: 2px; margin-top: 5px;">
            <div class="upload-progress-bar" style="height: 100%; width: 0%; background: #4caf50; border-radius: 2px; transition: width 0.3s;"></div>
          </div>
        `;
        progressContainer.appendChild(progressElement);

        // Subir el archivo con metadata que incluya información de autenticación
        const uploadTask = storageRef.put(file, {
          contentType: file.type,
          customMetadata: {
            'uploadedBy': user.uid,
            'isAnonymous': user.isAnonymous ? 'true' : 'false',
            'uploadedAt': new Date().toISOString(),
            'originalName': file.name,
            'documentId': docId
          }
        });

        // Esperar a que termine esta subida
        const downloadURL = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              // Actualizar progreso
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              const progressText = progressElement.querySelector('.upload-progress');
              const progressBar = progressElement.querySelector('.upload-progress-bar');
              
              if (progressText) progressText.textContent = `${Math.round(progress)}%`;
              if (progressBar) progressBar.style.width = `${progress}%`;
            },
            (error) => {
              // Error en subida
              console.error(`Error subiendo ${file.name}:`, error);
              const statusSpan = progressElement.querySelector('.upload-status');
              if (statusSpan) statusSpan.textContent = '❌';
              progressElement.style.color = '#d32f2f';
              reject(error);
            },
            async () => {
              // Subida completada
              try {
                const url = await uploadTask.snapshot.ref.getDownloadURL();
                console.log(`✅ Subida exitosa: ${file.name}`);
                
                const statusSpan = progressElement.querySelector('.upload-status');
                if (statusSpan) statusSpan.textContent = '✅';
                progressElement.style.color = '#2e7d32';
                
                resolve(url);
              } catch (urlError) {
                console.error(`Error obteniendo URL:`, urlError);
                const statusSpan = progressElement.querySelector('.upload-status');
                if (statusSpan) statusSpan.textContent = '⚠️';
                progressElement.style.color = '#f57c00';
                resolve(null);
              }
            }
          );
        });

        if (downloadURL) {
          urls.push(downloadURL);
        }

      } catch (error) {
        console.error(`Error procesando ${file.name}:`, error);
        // Continuar con el siguiente archivo
      }
    }

    console.log(`Subida finalizada. ${urls.length}/${files.length} imágenes subidas.`);
    return urls;

  } catch (authError) {
    console.error("Error de autenticación para subida de imágenes:", authError);
    throw new Error("No se pudo autenticar para subir imágenes: " + authError.message);
  }
}

// Función mejorada para autenticación anónima
async function ensureAuth() {
  return new Promise((resolve, reject) => {
    // Verificar si ya hay un usuario autenticado
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe(); // Dejar de escuchar cambios
      
      if (user) {
        console.log("Usuario ya autenticado:", user.uid);
        resolve(user);
        return;
      }
      
      // Si no hay usuario, autenticar anónimamente
      console.log("Iniciando autenticación anónima...");
      auth.signInAnonymously()
        .then((userCredential) => {
          console.log("Autenticación anónima exitosa:", userCredential.user.uid);
          resolve(userCredential.user);
        })
        .catch((error) => {
          console.error("Error en autenticación anónima:", error);
          reject(error);
        });
    }, (error) => {
      unsubscribe();
      console.error("Error en onAuthStateChanged:", error);
      reject(error);
    });
  });
}

// --- MEJORA en setupFormSubmission ---
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
    let statusDiv = document.getElementById('upload-status');
    if (!statusDiv) {
      statusDiv = document.createElement('div');
      statusDiv.id = 'upload-status';
      statusDiv.style.padding = '1rem';
      statusDiv.style.margin = '1rem 0';
      statusDiv.style.borderRadius = '8px';
      statusDiv.style.backgroundColor = '#f8f9fa';
      form.appendChild(statusDiv);
    }

    function updateStatus(message, type = 'info') {
      const colors = {
        info: { bg: '#e3f2fd', text: '#1565c0', border: '#2196f3' },
        success: { bg: '#e8f5e9', text: '#2e7d32', border: '#4caf50' },
        warning: { bg: '#fff3e0', text: '#f57c00', border: '#ff9800' },
        error: { bg: '#ffebee', text: '#c62828', border: '#f44336' }
      };
      
      const color = colors[type] || colors.info;
      statusDiv.style.backgroundColor = color.bg;
      statusDiv.style.color = color.text;
      statusDiv.style.borderLeft = `4px solid ${color.border}`;
      statusDiv.innerHTML = `<p><strong>Estado:</strong> ${message}</p>`;
      
      console.log(`Estado: ${message}`);
    }

    try {
      updateStatus("Iniciando proceso de guardado...", "info");
      
      // Asegurar autenticación
      updateStatus("Autenticando...", "info");
      await ensureAuth();
      updateStatus("Autenticación exitosa", "success");

      // Recopilar datos del formulario
      const data = {};
      new FormData(form).forEach((value, key) => {
        data[key] = value;
      });

      // Validación básica
      if (!data.email || !data.nombre) {
        updateStatus("Error: Nombre y correo son obligatorios", "error");
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        return;
      }

      // Recopilar odontograma
      data.odontograma = {};
      document.querySelectorAll(".tooth-input").forEach(input => {
        if (input.value.trim() !== "") {
          data.odontograma[input.name] = input.value;
        }
      });

      // Recopilar costos
      const costos = [];
      document.querySelectorAll("#tablaCostos tbody tr").forEach(tr => {
        const fechaInput = tr.querySelector("[name='fechaCosto']");
        const conceptoInput = tr.querySelector("[name='conceptoCosto']");
        const costoInput = tr.querySelector("[name='costoCosto']");
        
        if (fechaInput && conceptoInput && costoInput) {
          costos.push({
            fecha: fechaInput.value,
            concepto: conceptoInput.value,
            costo: parseFloat(costoInput.value) || 0
          });
        }
      });
      data.costos = costos;
      data.totalGeneral = parseFloat(document.getElementById("granTotal").textContent) || 0;

      // Metadatos
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

      // En setupFormSubmission(), después de recopilar los datos, agrega:
      data.userId = user.uid;
      data.userEmail = user.email || "anonimo@ejemplo.com";

      // 1) Guardar documento principal
      updateStatus("Guardando datos principales...", "info");
      const docRef = await db.collection("historial-odontologia").add(data);
      console.log("📄 Documento guardado con ID:", docRef.id);
      updateStatus("Datos principales guardados correctamente", "success");

      // 2) Subir imágenes si las hay
      const inputImgs = document.getElementById("imagenes");
      const files = inputImgs?.files ? Array.from(inputImgs.files) : [];
      
      if (files.length > 0) {
        updateStatus(`Subiendo ${files.length} imagen(es)...`, "info");
        try {
          const imageUrls = await subirImagenes(docRef.id, files);
          
          if (imageUrls.length > 0) {
            // Actualizar documento con URLs de imágenes
            updateStatus("Actualizando documento con imágenes...", "info");
            await docRef.update({ 
              imagenesAdjuntas: imageUrls,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp() 
            });
            updateStatus(`✅ ${imageUrls.length} imagen(es) subidas correctamente`, "success");
          } else {
            updateStatus("⚠️ No se subieron imágenes (posibles errores)", "warning");
          }
        } catch (error) {
          console.error("Error en subida de imágenes:", error);
          updateStatus("⚠️ Error subiendo imágenes, pero los datos se guardaron", "warning");
        }
      } else {
        updateStatus("No hay imágenes para subir", "info");
      }

      // 3) Redirigir al preview
      updateStatus("✅ Proceso completado. Redirigiendo...", "success");
      
      setTimeout(() => {
        window.location.href = `preview-odontologia.html?id=${docRef.id}`;
      }, 1500);

    } catch (error) {
      console.error("❌ Error en el proceso completo:", error);
      updateStatus(`Error: ${error.message}`, "error");
      alert("Ocurrió un error al guardar. Revisa la consola para más detalles.");
      
      // Restaurar botón
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  });
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