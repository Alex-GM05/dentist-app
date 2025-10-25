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

// --- Variables Globales ---
// const params = new URLSearchParams(window.location.search); // --- MOVIDO ---
// const docId = params.get('id'); // --- MOVIDO ---
let imagenesExistentes = []; // Almacenará URLs de imágenes actuales
let imagenesParaEliminar = []; // Almacenará URLs a eliminar de Storage

// --- FUNCIÓN ensureAuth ---
async function ensureAuth() {
  return new Promise((resolve, reject) => {
    const user = auth.currentUser;
    if (user) {
      console.log("Usuario ya autenticado:", user.uid, "Anónimo:", user.isAnonymous);
      resolve(user);
      return;
    }
    console.log("Iniciando autenticación anónima...");
    const authTimeout = setTimeout(() => reject(new Error("Timeout en autenticación anónima")), 10000);
    
    auth.signInAnonymously()
      .then((userCredential) => {
        clearTimeout(authTimeout);
        console.log("Autenticación anónima exitosa:", userCredential.user.uid);
        resolve(userCredential.user);
      })
      .catch((error) => {
        clearTimeout(authTimeout);
        console.error("Error en autenticación anónima:", error);
        reject(error);
      });
  });
}

// --- Generar odontograma (Igual que en add) ---
function generarOdontograma() {
  const tbody = document.querySelector("#tablaOdontograma tbody");
  if (!tbody) return;
  tbody.innerHTML = ''; // Limpiar por si acaso
  
  const dientesSuperiores = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const dientesInferiores = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
  
  for (let i = 0; i < 8; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < 3; j++) {
      const td = document.createElement('td');
      if (j === 0) {
        td.innerHTML = `<div class="tooth-od">${dientesSuperiores[i]}</div>`;
        td.style.backgroundColor = "#f0f0f0"; td.style.fontWeight = "bold";
      } else {
        const input = document.createElement('input');
        input.type = 'text'; input.className = 'tooth-input';
        input.name = `diente_${dientesSuperiores[i]}_${['OD', 'DX', 'TX'][j]}`;
        input.placeholder = `${['OD', 'DX', 'TX'][j]}`;
        td.appendChild(input);
      }
      tr.appendChild(td);
    }
    for (let j = 0; j < 3; j++) {
      const td = document.createElement('td');
      if (j === 0) {
        td.innerHTML = `<div class="tooth-od">${dientesSuperiores[i+8]}</div>`;
        td.style.backgroundColor = "#f0f0f0"; td.style.fontWeight = "bold";
      } else {
        const input = document.createElement('input');
        input.type = 'text'; input.className = 'tooth-input';
        input.name = `diente_${dientesSuperiores[i+8]}_${['OD', 'DX', 'TX'][j]}`;
        input.placeholder = `${['OD', 'DX', 'TX'][j]}`;
        td.appendChild(input);
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  
  const separator = document.createElement('tr');
  separator.innerHTML = '<td colspan="6" style="background-color: #f0f0f0; text-align: center; font-weight: bold;">Arcada Inferior</td>';
  tbody.appendChild(separator);
  
  for (let i = 0; i < 8; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < 3; j++) {
      const td = document.createElement('td');
      if (j === 0) {
        td.innerHTML = `<div class="tooth-od">${dientesInferiores[i]}</div>`;
        td.style.backgroundColor = "#f0f0f0"; td.style.fontWeight = "bold";
      } else {
        const input = document.createElement('input');
        input.type = 'text'; input.className = 'tooth-input';
        input.name = `diente_${dientesInferiores[i]}_${['OD', 'DX', 'TX'][j]}`;
        input.placeholder = `${['OD', 'DX', 'TX'][j]}`;
        td.appendChild(input);
      }
      tr.appendChild(td);
    }
    for (let j = 0; j < 3; j++) {
      const td = document.createElement('td');
      if (j === 0) {
        td.innerHTML = `<div class="tooth-od">${dientesInferiores[i+8]}</div>`;
        td.style.backgroundColor = "#f0f0f0"; td.style.fontWeight = "bold";
      } else {
        const input = document.createElement('input');
        input.type = 'text'; input.className = 'tooth-input';
        input.name = `diente_${dientesInferiores[i+8]}_${['OD', 'DX', 'TX'][j]}`;
        input.placeholder = `${['OD', 'DX', 'TX'][j]}`;
        td.appendChild(input);
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

// --- Condicionales (Igual que en add) ---
function setupConditionals() {
  const embarazoSelect = document.getElementById("embarazo");
  const drogasSelect = document.getElementById("drogas");
  
  if (embarazoSelect) {
    embarazoSelect.addEventListener("change", function() {
      const embarazoExtra = document.getElementById("embarazoExtra");
      if (embarazoExtra) embarazoExtra.style.display = this.value === "Sí" ? "block" : "none";
    });
    // Disparar el evento al cargar por si ya está seleccionado "Sí"
    embarazoSelect.dispatchEvent(new Event('change'));
  }
  
  if (drogasSelect) {
    drogasSelect.addEventListener("change", function() {
      const drogasExtra = document.getElementById("drogasExtra");
      if (drogasExtra) drogasExtra.style.display = this.value === "Sí" ? "block" : "none";
    });
    // Disparar el evento al cargar
    drogasSelect.dispatchEvent(new Event('change'));
  }
}

// --- Cálculos financieros ---
function calcularGranTotalCargos() {
  let total = 0;
  document.querySelectorAll("#tablaCostos input[name='costoCosto']").forEach(input => {
    total += parseFloat(input.value) || 0;
  });
  const granTotalElement = document.getElementById("granTotalCargos");
  if (granTotalElement) granTotalElement.textContent = total.toFixed(2);
  calcularSaldoPendiente();
}

function calcularGranTotalAbonos() {
  let total = 0;
  document.querySelectorAll("#tablaAbonos input[name='montoAbono']").forEach(input => {
    total += parseFloat(input.value) || 0;
  });
  const granTotalElement = document.getElementById("granTotalAbonos");
  if (granTotalElement) granTotalElement.textContent = total.toFixed(2);
  calcularSaldoPendiente();
}

function calcularSaldoPendiente() {
  const totalCargos = parseFloat(document.getElementById("granTotalCargos").textContent) || 0;
  const totalAbonos = parseFloat(document.getElementById("granTotalAbonos").textContent) || 0;
  const saldo = totalCargos - totalAbonos;
  const saldoElement = document.getElementById("saldoPendiente");
  if (saldoElement) {
    saldoElement.textContent = saldo.toFixed(2);
    saldoElement.style.color = saldo > 0 ? '#e63946' : '#2a9d8f';
  }
}

// --- Costos (Cargos) dinámicos ---
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
    
    tr.querySelector("input[name='costoCosto']").addEventListener("input", calcularGranTotalCargos);
    calcularGranTotalCargos();
  };
  
  window.eliminarFilaCosto = function(btn) {
    btn.closest("tr").remove();
    calcularGranTotalCargos();
  };
  
  window.limpiarFilasCostos = function() {
    if (confirm("¿Estás seguro de que quieres eliminar todos los cargos?")) {
      tbodyCostos.innerHTML = "";
      calcularGranTotalCargos();
    }
  };
}

// --- Abonos (Pagos) dinámicos (NUEVO) ---
function setupAbonos() {
  const tbodyAbonos = document.querySelector("#tablaAbonos tbody");
  if (!tbodyAbonos) return;
  
  window.agregarFilaAbono = function(fecha = new Date().toISOString().split('T')[0], concepto = "", monto = 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="date" name="fechaAbono" value="${fecha}" required></td>
      <td><input type="text" name="conceptoAbono" value="${concepto}" placeholder="Efectivo, Tarjeta, etc." required></td>
      <td><input type="number" name="montoAbono" value="${monto}" min="0" step="0.01" required></td>
      <td><button type="button" onclick="eliminarFilaAbono(this)">❌</button></td>
    `;
    tbodyAbonos.appendChild(tr);
    
    tr.querySelector("input[name='montoAbono']").addEventListener("input", calcularGranTotalAbonos);
    calcularGranTotalAbonos();
  };
  
  window.eliminarFilaAbono = function(btn) {
    btn.closest("tr").remove();
    calcularGranTotalAbonos();
  };
  
  window.limpiarFilasAbonos = function() {
    if (confirm("¿Estás seguro de que quieres eliminar todos los abonos?")) {
      tbodyAbonos.innerHTML = "";
      calcularGranTotalAbonos();
    }
  };
}

// --- Previsualización local de imágenes NUEVAS ---
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
        div.innerHTML = `<img src="${url}" alt="Nueva imagen"><p>${file.name}</p>`;
        previewCont.appendChild(div);
      });
    });
  }
}

// --- Renderizar imágenes EXISTENTES ---
function renderizarImagenesExistentes() {
  const container = document.getElementById("imagenesExistentes");
  if (!container) return;
  container.innerHTML = "";
  
  if (!imagenesExistentes || imagenesExistentes.length === 0) {
      container.innerHTML = "<p>No hay imágenes guardadas.</p>";
      return;
  }
  
  imagenesExistentes.forEach(url => {
    const div = document.createElement("div");
    div.className = "imagen-item"; // Usar la clase del CSS
    div.innerHTML = `
      <img src="${url}" alt="Imagen existente">
      <button type="button" class="eliminar-imagen" title="Marcar para eliminar">❌</button>
    `;
    
    div.querySelector(".eliminar-imagen").addEventListener("click", () => {
      // Marcar para eliminar
      if (confirm("¿Seguro que quieres eliminar esta imagen al guardar?")) {
        div.style.opacity = "0.5";
        div.querySelector("img").style.filter = "grayscale(100%)";
        div.querySelector(".eliminar-imagen").disabled = true;
        
        if (!imagenesParaEliminar.includes(url)) {
          imagenesParaEliminar.push(url);
        }
        console.log("Marcada para eliminar:", url);
      }
    });
    
    container.appendChild(div);
  });
}

// --- Eliminar imágenes de Storage ---
async function eliminarImagenesDeStorage() {
  if (imagenesParaEliminar.length === 0) return;
  console.log("Eliminando imágenes de Storage:", imagenesParaEliminar);
  
  const promises = imagenesParaEliminar.map(url => {
    try {
      const storageRef = storage.refFromURL(url);
      return storageRef.delete();
    } catch (error) {
      console.warn(`No se pudo eliminar ${url}:`, error.message);
      return Promise.resolve(); // No fallar si una URL es inválida
    }
  });
  
  await Promise.allSettled(promises);
  console.log("Eliminación de imágenes completada.");
}

// --- Función para subir imágenes (Igual que en add) ---
async function subirImagenes(docId, files) {
  const urls = [];
  if (!files || files.length === 0) return urls;
  const user = await ensureAuth();
  
  // (El código de la barra de progreso de 'add-odontologia.js' va aquí)
  // ... (re-usando la misma lógica de progreso) ...
  let progressContainer = document.getElementById('upload-progress-container');
  if (progressContainer) {
      progressContainer.innerHTML = '<h3>Subiendo nuevas imágenes...</h3>';
      progressContainer.style.display = 'block';
  }

  for (const file of files) {
    try {
      if (file.size > 5 * 1024 * 1024) continue;
      
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const path = `historial-odontologia/${docId}/adjuntos/${fileName}`;
      const storageRef = storage.ref(path);

      // (Aquí iría la lógica para crear el progressElement individual)
      console.log(`Subiendo ${file.name}...`);
      
      const uploadTask = storageRef.put(file, { contentType: file.type });
      
      // Esperar a que la subida se complete
      await uploadTask;
      
      // Obtener la URL de descarga
      const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
      urls.push(downloadURL);
      console.log(`Subido ${file.name}, URL: ${downloadURL}`);

    } catch (error) {
      console.error(`Error procesando ${file.name}:`, error);
    }
  }
  if (progressContainer) progressContainer.style.display = 'none';
  return urls;
}

// --- Función para poblar el formulario ---
function poblarFormulario(data) {
  const form = document.getElementById("odontologiaForm");
  
  // 1. Poblar inputs, textareas y selects simples
  Object.keys(data).forEach(key => {
    const input = form.querySelector(`[name="${key}"]`);
    if (input) {
      if (input.tagName === 'SELECT') {
        input.value = data[key];
      } else if (input.type === 'radio' || input.type === 'checkbox') {
        // (No aplica en este form, pero es bueno tenerlo)
        input.checked = data[key];
      } else {
        input.value = data[key];
      }
    }
  });
  
  // 2. Poblar odontograma
  if (data.odontograma) {
    Object.keys(data.odontograma).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = data.odontograma[key];
      }
    });
  }
  
  // 3. Poblar Costos
  const tbodyCostos = document.querySelector("#tablaCostos tbody");
  tbodyCostos.innerHTML = ""; // Limpiar
  if (data.costos && Array.isArray(data.costos) && data.costos.length > 0) {
    data.costos.forEach(costo => {
      agregarFilaCosto(costo.fecha, costo.concepto, costo.costo);
    });
  } else {
      agregarFilaCosto(); // Agregar una fila vacía si no hay costos
  }
  
  // 4. Poblar Abonos
  const tbodyAbonos = document.querySelector("#tablaAbonos tbody");
  tbodyAbonos.innerHTML = ""; // Limpiar
  if (data.abonos && Array.isArray(data.abonos) && data.abonos.length > 0) {
    data.abonos.forEach(abono => {
      agregarFilaAbono(abono.fecha, abono.concepto, abono.monto);
    });
  } else {
      agregarFilaAbono(new Date().toISOString().split('T')[0], "", 0); // Agregar una fila vacía
  }
  
  // 5. Poblar Imágenes
  imagenesExistentes = data.imagenesAdjuntas || [];
  renderizarImagenesExistentes();
  
  // 6. Calcular totales
  calcularGranTotalCargos();
  calcularGranTotalAbonos();
  // El saldo pendiente se calcula dentro de las funciones anteriores
  
  // 7. Activar condicionales
  setupConditionals();
}

// --- Cargar Datos del Paciente ---
async function cargarDatosDelPaciente(id) {
  try {
    const docRef = db.collection("historial-odontologia").doc(id);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      console.log("Datos del documento:", docSnap.data());
      poblarFormulario(docSnap.data());
    } else {
      console.error("No se encontró el documento!");
      document.getElementById("odontologiaContainer").innerHTML = "<h1>Error: No se encontró el historial de este paciente.</h1>";
    }
  } catch (error) {
    console.error("Error cargando el documento:", error);
    document.getElementById("odontologiaContainer").innerHTML = `<h1>Error al cargar: ${error.message}</h1>`;
  }
}

// --- setupFormSubmission (MODIFICADO PARA ACTUALIZAR) ---
function setupFormSubmission(docId) {
  const form = document.getElementById("odontologiaForm");
  if (!form) return;
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = "Actualizando...";
    submitButton.disabled = true;

    let statusDiv = document.getElementById('upload-status');
    statusDiv.style.display = 'block';

    function updateStatus(message, type = 'info') {
      // (Misma función de status que en add-odontologia.js)
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
       statusDiv.innerHTML = `<p style="padding: 1rem;"><strong>Estado:</strong> ${message}</p>`;
    }

    try {
      updateStatus("Iniciando proceso de actualización...", "info");
      
      await ensureAuth();
      updateStatus("Autenticación exitosa", "success");
      
      const data = {};
      new FormData(form).forEach((value, key) => {
        data[key] = value;
      });

      if (!data.email || !data.nombre) {
        throw new Error("Nombre y correo son obligatorios");
      }

      // 1. Recolectar Odontograma
      data.odontograma = {};
      document.querySelectorAll(".tooth-input").forEach(input => {
        if (input.value.trim() !== "") data.odontograma[input.name] = input.value;
      });

      // 2. Recolectar Costos
      const costos = [];
      document.querySelectorAll("#tablaCostos tbody tr").forEach(tr => {
        const fechaInput = tr.querySelector("[name='fechaCosto']");
        const conceptoInput = tr.querySelector("[name='conceptoCosto']");
        const costoInput = tr.querySelector("[name='costoCosto']");
        if (fechaInput && conceptoInput && costoInput && (conceptoInput.value || costoInput.value)) {
          costos.push({
            fecha: fechaInput.value,
            concepto: conceptoInput.value,
            costo: parseFloat(costoInput.value) || 0
          });
        }
      });
      data.costos = costos;
      
      // 3. Recolectar Abonos
      const abonos = [];
      document.querySelectorAll("#tablaAbonos tbody tr").forEach(tr => {
        const fechaInput = tr.querySelector("[name='fechaAbono']");
        const conceptoInput = tr.querySelector("[name='conceptoAbono']");
        const montoInput = tr.querySelector("[name='montoAbono']");
        if (fechaInput && conceptoInput && montoInput && (conceptoInput.value || montoInput.value)) {
          abonos.push({
            fecha: fechaInput.value,
            concepto: conceptoInput.value,
            monto: parseFloat(montoInput.value) || 0
          });
        }
      });
      data.abonos = abonos;

      // 4. Recolectar Totales
      data.totalGeneral = parseFloat(document.getElementById("granTotalCargos").textContent) || 0;
      data.totalAbonos = parseFloat(document.getElementById("granTotalAbonos").textContent) || 0;
      data.saldoPendiente = parseFloat(document.getElementById("saldoPendiente").textContent) || 0;

      // 5. Timestamp de actualización
      data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      
      // 6. Manejar Imágenes
      
      // 6a. Eliminar las marcadas
      if (imagenesParaEliminar.length > 0) {
        updateStatus("Eliminando imágenes antiguas...", "info");
        await eliminarImagenesDeStorage();
        updateStatus("Imágenes eliminadas", "success");
      }
      
      // 6b. Subir las nuevas
      const inputImgs = document.getElementById("imagenes");
      const files = inputImgs?.files ? Array.from(inputImgs.files) : [];
      let nuevasImageUrls = [];
      
      if (files.length > 0) {
        updateStatus(`Subiendo ${files.length} nueva(s) imagen(es)...`, "info");
        nuevasImageUrls = await subirImagenes(docId, files);
        updateStatus(`✅ ${nuevasImageUrls.length} imagen(es) subidas`, "success");
      }
      
      // 6c. Consolidar lista final de imágenes
      const imagenesActuales = imagenesExistentes.filter(url => !imagenesParaEliminar.includes(url));
      data.imagenesAdjuntas = [...imagenesActuales, ...nuevasImageUrls];

      // 7. Actualizar el documento en Firestore
      updateStatus("Guardando datos principales...", "info");
      const docRef = db.collection("historial-odontologia").doc(docId);
      await docRef.update(data);
      updateStatus("Datos actualizados correctamente", "success");

      // 8. Redirigir
      updateStatus("✅ Proceso completado. Redirigiendo...", "success");
      setTimeout(() => {
        window.location.href = `preview-odontologia.html?id=${docId}`;
      }, 1500);

    } catch (error) {
      updateStatus(`Error: ${error.message}`, "error");
      alert("Ocurrió un error al actualizar. Revisa la consola para más detalles.");
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  });
}

// --- Inicialización cuando el DOM esté listo ---
document.addEventListener('DOMContentLoaded', async () => {
  // --- MOVIDAS AQUÍ ---
  const params = new URLSearchParams(window.location.search);
  const docId = params.get('id');
  // --- FIN DEL CAMBIO ---

  const loader = document.getElementById('loader');
  const container = document.getElementById('odontologiaContainer');

  if (!docId) {
    loader.style.display = 'none';
    container.style.display = 'block';
    container.innerHTML = '<h1>Error: No se proporcionó un ID de paciente.</h1><p>Asegúrate de que la URL contenga "?id=DOCUMENTO_ID"</p>';
    return;
  }

  try {
    console.log("Inicializando... Autenticando...");
    await ensureAuth();
    
    console.log("Generando UI...");
    // 1. Setup UI skeletons and global functions
    generarOdontograma();
    setupCostos(); // Define window.agregarFilaCosto, etc.
    setupAbonos(); // Define window.agregarFilaAbono, etc.
    setupImagePreview(); // Define listener for <input type="file">

    console.log("Cargando datos del paciente...");
    // 2. Fetch data and populate the UI
    await cargarDatosDelPaciente(docId); // This will call agregarFilaCosto/Abono

    console.log("Configurando envío...");
    // 3. Setup the submit listener
    setupFormSubmission(docId); 

    container.style.display = 'block';
  } catch (error) {
    console.error("Error fatal en la inicialización:", error);
    container.innerHTML = `<h1>Error al cargar: ${error.message}</h1>`;
    container.style.display = 'block';
  } finally {
    loader.style.display = 'none';
  }
});