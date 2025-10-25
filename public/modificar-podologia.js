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
  console.log("Firebase inicializado correctamente para Modificar Podología");
} catch (error) {
  console.error("Error inicializando Firebase:", error);
  // Considerar mostrar un error al usuario aquí
}

// --- Variables Globales ---
let pacienteId = null; // Se establecerá en DOMContentLoaded
let imagenesExistentes = []; // Almacenará objetos { url, path, nombre, fecha }
let imagenesParaEliminar = []; // Almacenará paths de Storage a eliminar
let archivosNuevasImagenes = []; // Almacenará los File objects de nuevas imágenes

// --- FUNCIÓN ensureAuth (Reutilizada de Odontología) ---
async function ensureAuth() {
  return new Promise((resolve, reject) => {
    const user = auth.currentUser;
    if (user) {
      console.log("Usuario ya autenticado:", user.uid, "Anónimo:", user.isAnonymous);
      resolve(user); return;
    }
    console.log("Iniciando autenticación anónima...");
    const t = setTimeout(() => reject(new Error("Timeout auth")), 10000);
    auth.signInAnonymously().then(c => { clearTimeout(t); resolve(c.user); })
      .catch(e => { clearTimeout(t); reject(e); });
  });
}

// --- Lógica Específica de Podología ---

// Mostrar/ocultar secciones de mujeres
function toggleSeccionesMujer() {
  const sexo = document.getElementById('sexo')?.value; // Usar ?. por si no existe
  const seccionMujeres = document.getElementById('seccion-mujeres');
  const seccionEmbarazo = document.getElementById('seccion-embarazo');
  if (seccionMujeres) seccionMujeres.style.display = sexo === 'Mujer' ? 'block' : 'none';
  if (seccionEmbarazo) seccionEmbarazo.style.display = sexo === 'Mujer' ? 'block' : 'none';
}

// Calcular IMC
function calcularIMC() {
  const pesoInput = document.getElementById('peso');
  const estaturaInput = document.getElementById('estatura');
  const imcInput = document.getElementById('imc');
  if (!pesoInput || !estaturaInput || !imcInput) return; // Verificar existencia

  const peso = parseFloat(pesoInput.value);
  const estatura = parseFloat(estaturaInput.value);
  imcInput.value = (peso > 0 && estatura > 0) ? (peso / ((estatura / 100) ** 2)).toFixed(2) : '';
}

// --- Lógica Financiera (Reutilizada de Odontología) ---
function calcularGranTotalCargos() { /* Idéntica a modificar-odontologia.js */
  let total = 0;
  document.querySelectorAll("#tablaCostos input[name='costoCosto']").forEach(i => { total += parseFloat(i.value) || 0; });
  const el = document.getElementById("granTotalCargos");
  if (el) el.textContent = total.toFixed(2);
  calcularSaldoPendiente();
}
function calcularGranTotalAbonos() { /* Idéntica a modificar-odontologia.js */
  let total = 0;
  document.querySelectorAll("#tablaAbonos input[name='montoAbono']").forEach(i => { total += parseFloat(i.value) || 0; });
  const el = document.getElementById("granTotalAbonos");
  if (el) el.textContent = total.toFixed(2);
  calcularSaldoPendiente();
}
function calcularSaldoPendiente() { /* Idéntica a modificar-odontologia.js */
  const c = parseFloat(document.getElementById("granTotalCargos")?.textContent) || 0;
  const a = parseFloat(document.getElementById("granTotalAbonos")?.textContent) || 0;
  const s = c - a;
  const el = document.getElementById("saldoPendiente");
  if (el) { el.textContent = s.toFixed(2); el.style.color = s > 0 ? '#e63946' : '#2a9d8f'; }
}

// --- Costos (Cargos) Dinámicos (Reutilizada de Odontología) ---
function setupCostos() { /* Idéntica a modificar-odontologia.js */
  const tbody = document.querySelector("#tablaCostos tbody");
  if (!tbody) return;
  window.agregarFilaCosto = (f = new Date().toISOString().split('T')[0], c = "", co = 0) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><input type="date" name="fechaCosto" value="${f}" req></td><td><input type="text" name="conceptoCosto" value="${c}" placeholder="Desc." req></td><td><input type="number" name="costoCosto" value="${co}" min="0" step="0.01" req></td><td><button type="button" onclick="eliminarFilaCosto(this)">X</button></td>`;
    tbody.appendChild(tr); tr.querySelector("[name='costoCosto']").addEventListener("input", calcularGranTotalCargos); calcularGranTotalCargos();
  };
  window.eliminarFilaCosto = (b) => { b.closest("tr")?.remove(); calcularGranTotalCargos(); };
  window.limpiarFilasCostos = () => { if (confirm("Limpiar cargos?")) { tbody.innerHTML = ""; calcularGranTotalCargos(); } };
}

// --- Abonos (Pagos) Dinámicos (Reutilizada de Odontología) ---
function setupAbonos() { /* Idéntica a modificar-odontologia.js */
  const tbody = document.querySelector("#tablaAbonos tbody");
  if (!tbody) return;
  window.agregarFilaAbono = (f = new Date().toISOString().split('T')[0], c = "", mtd = "Efectivo", mnt = 0) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><input type="date" name="fechaAbono" value="${f}" req></td><td><input type="text" name="conceptoAbono" value="${c}" placeholder="Desc." req></td><td><select name="metodoAbono" req><option ${mtd=='Efectivo'?'selected':''}>Efectivo</option><option ${mtd=='Tarjeta'?'selected':''}>Tarjeta</option><option ${mtd=='Transferencia'?'selected':''}>Transferencia</option><option ${mtd=='Otro'?'selected':''}>Otro</option></select></td><td><input type="number" name="montoAbono" value="${mnt}" min="0" step="0.01" req></td><td><button type="button" onclick="eliminarFilaAbono(this)">X</button></td>`;
    tbody.appendChild(tr); tr.querySelector("[name='montoAbono']").addEventListener("input", calcularGranTotalAbonos); calcularGranTotalAbonos();
  };
  window.eliminarFilaAbono = (b) => { b.closest("tr")?.remove(); calcularGranTotalAbonos(); };
  window.limpiarFilasAbonos = () => { if (confirm("Limpiar abonos?")) { tbody.innerHTML = ""; calcularGranTotalAbonos(); } };
}

// --- Manejo de Imágenes (Reutilizada de Odontología, adaptada para Podología) ---

// Previsualización local de imágenes NUEVAS
function setupImagePreview() {
  const inputImgs = document.getElementById("imagenesNuevas"); // ID actualizado
  const previewCont = document.getElementById("previewImagenes");
  if (!inputImgs || !previewCont) return;

  inputImgs.addEventListener("change", (event) => {
    previewCont.innerHTML = ""; // Limpiar previews anteriores
    archivosNuevasImagenes = Array.from(event.target.files); // Guardar File objects

    archivosNuevasImagenes.forEach((file, index) => {
      // Validar tamaño y tipo si es necesario aquí
      const url = URL.createObjectURL(file);
      const div = document.createElement("div");
      div.className = "thumb imagen-preview"; // Añadir clase para estilos y JS
      div.innerHTML = `<img src="${url}" alt="Nueva imagen"><p>${file.name}</p><button type="button" class="eliminar-preview" data-index="${index}">❌</button>`;
      previewCont.appendChild(div);
    });

    // Añadir listeners a los botones de eliminar preview DESPUÉS de añadirlos al DOM
    previewCont.querySelectorAll('.eliminar-preview').forEach(button => {
        button.addEventListener('click', handleEliminarPreview);
    });
  });
}

function handleEliminarPreview(event) {
    const indexToRemove = parseInt(event.target.dataset.index);
    // Eliminar del array de archivos
    archivosNuevasImagenes.splice(indexToRemove, 1);
    // Eliminar del DOM
    event.target.closest('.imagen-preview').remove();
    // Re-indexar los botones restantes (importante si se eliminan varios)
    document.querySelectorAll('#previewImagenes .eliminar-preview').forEach((button, newIndex) => {
        button.dataset.index = newIndex;
    });
    console.log("Archivos restantes para subir:", archivosNuevasImagenes.map(f=>f.name));
}


// Renderizar imágenes EXISTENTES
function renderizarImagenesExistentes() {
  const container = document.getElementById("imagenesExistentes");
  if (!container) return;
  container.innerHTML = "";

  if (!imagenesExistentes || imagenesExistentes.length === 0) {
    container.innerHTML = "<p>No hay imágenes guardadas.</p>"; return;
  }

  imagenesExistentes.forEach((imgData, index) => { // imgData = {url, path, nombre, fecha}
    const div = document.createElement("div");
    div.className = "imagen-item";
    // Usamos data-path para saber qué eliminar de Storage
    div.innerHTML = `<img src="${imgData.url}" alt="${imgData.nombre || 'Imagen'}"><button type="button" class="eliminar-imagen" data-path="${imgData.path}" data-index="${index}" title="Marcar para eliminar">❌</button><p class="muted" style="font-size:0.7rem; text-align:center;">${imgData.nombre || 'imagen'}</p>`;
    container.appendChild(div);

    // Listener para marcar eliminación
     div.querySelector(".eliminar-imagen").addEventListener("click", handleMarcarEliminar);

  });
}

function handleMarcarEliminar(event) {
    const button = event.target;
    const pathToDelete = button.dataset.path;
    const index = parseInt(button.dataset.index);

     if (confirm(`¿Seguro que quieres eliminar esta imagen (${imagenesExistentes[index]?.nombre || 'imagen'}) al guardar?`)) {
        const div = button.closest('.imagen-item');
        div.style.opacity = "0.5";
        div.querySelector("img").style.filter = "grayscale(100%)";
        button.disabled = true;

        if (!imagenesParaEliminar.includes(pathToDelete)) {
          imagenesParaEliminar.push(pathToDelete);
        }
        console.log("Marcada para eliminar (path):", pathToDelete);
        console.log("Lista para eliminar:", imagenesParaEliminar);
      }
}

// Eliminar imágenes de Storage (usando PATH)
async function eliminarImagenesDeStorage() {
  if (imagenesParaEliminar.length === 0) return;
  console.log("Eliminando imágenes de Storage por path:", imagenesParaEliminar);

  const promises = imagenesParaEliminar.map(path => {
    if (!path || typeof path !== 'string') {
        console.warn("Path inválido para eliminar:", path);
        return Promise.resolve(); // Ignorar paths inválidos
    }
    try {
      // Directamente usamos el path guardado
      const storageRef = storage.ref(path);
      return storageRef.delete().then(() => console.log(`Eliminado: ${path}`))
             .catch(e => console.warn(`Warn: No se pudo eliminar ${path}:`, e.message)); // No fallar si ya no existe
    } catch (error) {
      console.error(`Error creando referencia para ${path}:`, error);
      return Promise.resolve();
    }
  });

  await Promise.allSettled(promises);
  console.log("Eliminación de imágenes de Storage completada.");
}

// Subir imágenes NUEVAS (usando archivos guardados)
async function subirNuevasImagenes(docId) {
  const urlsYPaths = [];
  if (archivosNuevasImagenes.length === 0) return urlsYPaths;
  const user = await ensureAuth();

  const progressContainer = document.getElementById('upload-progress-container');
  if(progressContainer) { progressContainer.innerHTML = '<h3>Subiendo nuevas imágenes...</h3>'; progressContainer.style.display = 'block'; }

  // Usar Promise.all para subidas en paralelo
  const uploadPromises = archivosNuevasImagenes.map(async (file) => {
      if (file.size > 5 * 1024 * 1024) { console.warn(`Archivo ${file.name} excede 5MB`); return null; }

      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const path = `historial-podologia/${docId}/adjuntos/${fileName}`; // Ruta específica de Podología
      const storageRef = storage.ref(path);

      try {
          console.log(`Subiendo ${file.name} a ${path}...`);
          const uploadTask = storageRef.put(file, { contentType: file.type });
          // Podrías añadir lógica de progreso aquí si la necesitas
          await uploadTask;
          const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
          console.log(`Subido ${file.name}, URL: ${downloadURL}`);
          return { url: downloadURL, path: path, nombre: file.name, fecha: new Date().toISOString() };
      } catch (error) {
          console.error(`Error subiendo ${file.name}:`, error);
          return null; // Devolver null si falla
      }
  });

  const results = await Promise.all(uploadPromises);

  if(progressContainer) progressContainer.style.display = 'none';

  // Filtrar resultados nulos (archivos grandes o errores)
  return results.filter(result => result !== null);
}


// --- Lógica de Carga y Guardado ---

// Poblar formulario con datos existentes
function poblarFormulario(data) {
  const form = document.getElementById("formPodologia");

  // Poblar campos simples (inputs, textareas, selects)
  Object.keys(data).forEach(key => {
    const input = form.querySelector(`[name="${key}"]`);
    if (input) {
      if (input.type === 'radio') {
        // Para radios, buscar el que tenga el valor correcto
        const targetRadio = form.querySelector(`input[name="${key}"][value="${data[key]}"]`);
        if (targetRadio) targetRadio.checked = true;
      } else if (input.tagName === 'SELECT') {
        input.value = data[key];
      } else {
        input.value = data[key];
      }
    }
  });

   // Poblar Antecedentes Médicos (objeto anidado)
  if (data.antecedentesMedicos) {
    Object.keys(data.antecedentesMedicos).forEach(key => {
      const targetRadio = form.querySelector(`input[name="${key}"][value="${data.antecedentesMedicos[key]}"]`);
      if (targetRadio) targetRadio.checked = true;
      else { // Si no se encuentra 'Sí', marcar 'No' (asumiendo que 'No' es el default)
          const noRadio = form.querySelector(`input[name="${key}"][value="No"]`);
          if(noRadio) noRadio.checked = true;
      }
    });
  } else {
      // Si no existe el objeto, marcar todos como 'No'
      ['embarazo', 'hipertension', 'insuficienciaCardiaca', 'marcapasos', 'diabetes', 'cancer', 'dermatitis', 'epilepsia', 'micosis', 'isquemias', 'trombosis'].forEach(key => {
          const noRadio = form.querySelector(`input[name="${key}"][value="No"]`);
          if(noRadio) noRadio.checked = true;
      });
  }


  // Activar secciones de mujer si aplica
  toggleSeccionesMujer();
  calcularIMC(); // Calcular IMC inicial

  // Poblar Costos
  const tbodyCostos = document.querySelector("#tablaCostos tbody");
  if(tbodyCostos) tbodyCostos.innerHTML = ""; // Limpiar
  if (data.costos && Array.isArray(data.costos) && data.costos.length > 0) {
    data.costos.forEach(c => agregarFilaCosto(c.fecha, c.concepto, c.costo));
  } else {
    agregarFilaCosto(); // Agregar fila vacía si no hay
  }

  // Poblar Abonos
  const tbodyAbonos = document.querySelector("#tablaAbonos tbody");
   if(tbodyAbonos) tbodyAbonos.innerHTML = ""; // Limpiar
  if (data.abonos && Array.isArray(data.abonos) && data.abonos.length > 0) {
    data.abonos.forEach(a => agregarFilaAbono(a.fecha, a.concepto, a.metodo, a.monto)); // Pasar los 4 args
  } else {
    agregarFilaAbono(); // Agregar fila vacía si no hay
  }

  // Poblar Imágenes Existentes
  // Asegurarse que 'imagenes' sea un array de objetos {url, path, nombre, fecha}
  imagenesExistentes = (Array.isArray(data.imagenes) ? data.imagenes : []).map(img => {
      if (typeof img === 'string') { // Compatibilidad con formato antiguo (solo URL)
          console.warn("Formato antiguo de imagen detectado (solo URL). Intentando inferir path.");
          // Intentar extraer path de la URL, puede fallar si la URL no es estándar
          const pathGuess = img.split('/o/')[1]?.split('?')[0]?.replace(/%2F/g, '/') || null;
          return { url: img, path: pathGuess, nombre: 'imagen', fecha: '' };
      }
      return img; // Asumir que ya es un objeto {url, path, ...}
  }).filter(img => img.url && img.path); // Filtrar las que no tengan URL o path inferido

  renderizarImagenesExistentes();

  // Calcular totales iniciales
  calcularGranTotalCargos();
  calcularGranTotalAbonos();
}

// Cargar Datos del Paciente desde Firestore
async function cargarDatosDelPaciente(id) {
  try {
    const docRef = db.collection("historial-podologia").doc(id); // Colección correcta
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      console.log("Datos del documento Podología:", docSnap.data());
      poblarFormulario(docSnap.data());
    } else {
      throw new Error("No se encontró el historial de podología para este paciente.");
    }
  } catch (error) {
    console.error("Error cargando documento Podología:", error);
    // Mostrar error al usuario
    const container = document.getElementById("podologiaContainer");
    if(container) container.innerHTML = `<h1>Error al cargar: ${error.message}</h1>`;
    throw error; // Propagar error para detener la inicialización
  }
}


// --- ACTUALIZAR PACIENTE (Form Submission) ---
async function actualizarPaciente(event) {
  event.preventDefault();
  const form = event.target; // El formulario que disparó el evento

  const submitButton = form.querySelector('#btnActualizar');
  const originalText = submitButton.textContent;
  submitButton.textContent = "Actualizando...";
  submitButton.disabled = true;

  const statusDiv = document.getElementById('upload-status');
  if(statusDiv) statusDiv.style.display = 'block';

  function updateStatus(message, type = 'info') {
      if(!statusDiv) return;
     const colors = { info:'blue', success:'green', warning:'orange', error:'red' };
     statusDiv.innerHTML = `<p style="padding: 1rem; border-left: 4px solid ${colors[type]}; background: #f0f0f0; color:${colors[type]}"><strong>Estado:</strong> ${message}</p>`;
  }

  try {
    updateStatus("Iniciando actualización...", "info");
    await ensureAuth(); // Asegurar autenticación

    // --- Recolectar Datos del Formulario ---
    const data = {};
    // Inputs, Selects, Textareas directos
    new FormData(form).forEach((value, key) => { data[key] = value; });

    // Recolectar Radios de Antecedentes
    data.antecedentesMedicos = {};
     ['embarazo', 'hipertension', 'insuficienciaCardiaca', 'marcapasos', 'diabetes', 'cancer', 'dermatitis', 'epilepsia', 'micosis', 'isquemias', 'trombosis'].forEach(key => {
        data.antecedentesMedicos[key] = form.querySelector(`input[name="${key}"]:checked`)?.value || 'No';
     });
     // Recolectar Radios de Mujer (asegurarse que existan primero)
     data.usoTacon = form.querySelector(`input[name="usoTacon"]:checked`)?.value || 'No';


    // --- Recolectar Costos (desde la tabla) ---
    const costosArray = [];
    document.querySelectorAll("#tablaCostos tbody tr").forEach(tr => {
      const fecha = tr.querySelector("[name='fechaCosto']")?.value;
      const concepto = tr.querySelector("[name='conceptoCosto']")?.value;
      const costo = parseFloat(tr.querySelector("[name='costoCosto']")?.value) || 0;
      if (fecha && (concepto || costo > 0)) { // Guardar si hay fecha y concepto o costo > 0
        costosArray.push({ fecha, concepto, costo });
      }
    });
    data.costos = costosArray;

    // --- Recolectar Abonos (desde la tabla) ---
    const abonosArray = [];
    document.querySelectorAll("#tablaAbonos tbody tr").forEach(tr => {
      const fecha = tr.querySelector("[name='fechaAbono']")?.value;
      const concepto = tr.querySelector("[name='conceptoAbono']")?.value;
      const metodo = tr.querySelector("[name='metodoAbono']")?.value;
      const monto = parseFloat(tr.querySelector("[name='montoAbono']")?.value) || 0;
      if (fecha && (concepto || metodo || monto > 0)) {
        abonosArray.push({ fecha, concepto, metodo, monto });
      }
    });
    data.abonos = abonosArray;

    // --- Recalcular y guardar Totales ---
    data.totalGeneral = parseFloat(document.getElementById("granTotalCargos")?.textContent) || 0;
    data.totalAbonos = parseFloat(document.getElementById("granTotalAbonos")?.textContent) || 0;
    data.saldoPendiente = parseFloat(document.getElementById("saldoPendiente")?.textContent) || 0;

    // --- Manejar Imágenes ---
    // 1. Eliminar las marcadas de Storage
    if (imagenesParaEliminar.length > 0) {
      updateStatus("Eliminando imágenes antiguas...", "info");
      await eliminarImagenesDeStorage();
      updateStatus("Imágenes eliminadas de Storage", "success");
    }

    // 2. Subir las nuevas
    let nuevasImagenesSubidas = [];
    if (archivosNuevasImagenes.length > 0) {
      updateStatus(`Subiendo ${archivosNuevasImagenes.length} nueva(s) imagen(es)...`, "info");
      nuevasImagenesSubidas = await subirNuevasImagenes(pacienteId); // Pasar ID del paciente
      updateStatus(`✅ ${nuevasImagenesSubidas.length} imagen(es) subidas`, "success");
    }

    // 3. Consolidar lista final de imágenes (OBJETOS COMPLETOS)
    // Filtrar las existentes que NO están marcadas para eliminar
    const imagenesActuales = imagenesExistentes.filter(img =>
        img && img.path && !imagenesParaEliminar.includes(img.path)
    );
    // Combinar actuales + nuevas
    data.imagenes = [...imagenesActuales, ...nuevasImagenesSubidas]; // Guardar array de objetos

    // --- Timestamp de Actualización ---
    data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    // Remover createdAt si existe para no sobreescribirlo accidentalmente
    delete data.createdAt;

    // --- Actualizar Documento en Firestore ---
    updateStatus("Guardando datos principales...", "info");
    const docRef = db.collection("historial-podologia").doc(pacienteId); // Colección correcta
    await docRef.update(data);
    updateStatus("Datos actualizados correctamente", "success");

    // --- Redirigir ---
    updateStatus("✅ Proceso completado. Redirigiendo...", "success");
    setTimeout(() => {
      window.location.href = `preview-podologia.html?id=${pacienteId}`; // Redirigir a preview de podología
    }, 1500);

  } catch (error) {
    console.error("Error completo al actualizar Podología:", error);
    updateStatus(`Error: ${error.message}`, "error");
    // Considerar mostrar un Swal.fire de error aquí
    alert("Ocurrió un error al actualizar. Revisa la consola.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}

// --- Inicialización General ---
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  pacienteId = params.get('edit'); // Leer 'edit'

  const loader = document.getElementById('loader');
  const container = document.getElementById('podologiaContainer');

  if (!pacienteId) {
    if(loader) loader.style.display = 'none';
    if(container) container.innerHTML = '<h1>Error: No se proporcionó ID de paciente (?edit=...).</h1>';
    return;
  }

  try {
    console.log("Inicializando Modificar Podología...");
    await ensureAuth();

    // Setup UI básica y listeners
    setupCostos();
    setupAbonos();
    setupImagePreview(); // Configura el input 'imagenesNuevas'
    document.getElementById('sexo')?.addEventListener('change', toggleSeccionesMujer);
    document.getElementById('peso')?.addEventListener('input', calcularIMC);
    document.getElementById('estatura')?.addEventListener('input', calcularIMC);
    document.getElementById('formPodologia')?.addEventListener('submit', actualizarPaciente); // Listener del submit

    // Cargar datos
    await cargarDatosDelPaciente(pacienteId);

    // Mostrar formulario después de cargar
     if(container) container.style.display = 'block';

  } catch (error) {
    console.error("Error fatal en inicialización Podología:", error);
     if(container) container.innerHTML = `<h1>Error al cargar: ${error.message}</h1>`;
     if(container) container.style.display = 'block'; // Mostrar el error
  } finally {
     if(loader) loader.style.display = 'none';
  }
});