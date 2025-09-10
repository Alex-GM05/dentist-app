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
  storage = firebase.storage();
  console.log("Firebase inicializado correctamente para podología");
} catch (error) {
  console.error("Error inicializando Firebase:", error);
}

// --- FUNCIÓN ensureAuth MEJORADA (igual que en odontologia) ---
async function ensureAuth() {
  return new Promise((resolve, reject) => {
    const user = auth.currentUser;
    
    if (user) {
      console.log("Usuario ya autenticado:", user.uid, "Anónimo:", user.isAnonymous);
      resolve(user);
      return;
    }
    
    console.log("Iniciando autenticación anónima...");
    
    const authTimeout = setTimeout(() => {
      reject(new Error("Timeout en autenticación anónima"));
    }, 10000);
    
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

// Calcular IMC automáticamente
function calcularIMC() {
  const peso = parseFloat(document.getElementById('peso').value);
  const estatura = parseFloat(document.getElementById('estatura').value);
  
  if (peso && estatura) {
    const estaturaMetros = estatura / 100;
    const imc = peso / (estaturaMetros * estaturaMetros);
    document.getElementById('imc').value = imc.toFixed(2);
  }
}

// --- SISTEMA DE COSTOS MEJORADO ---
function setupCostos() {
  const container = document.getElementById('costos-container');
  if (!container) return;
  
  // Función para calcular el total
  window.calcularTotalCostos = function() {
    let total = 0;
    document.querySelectorAll('.costo-monto').forEach(input => {
      total += parseFloat(input.value) || 0;
    });
    // Puedes mostrar el total en algún elemento si lo deseas
    console.log("Total calculado:", total);
    return total;
  };
  
  // Función para agregar fila de costo
  window.agregarFilaCosto = function(fecha = new Date().toISOString().split('T')[0], concepto = "", costo = 0) {
    const item = document.createElement('div');
    item.className = 'costo-item';
    item.innerHTML = `
      <div class="grid-3" style="margin-top: 1rem;">
        <div>
          <label class="odontologia-label">Fecha</label>
          <input type="date" class="odontologia-input costo-fecha" value="${fecha}">
        </div>
        <div>
          <label class="odontologia-label">Concepto</label>
          <input type="text" class="odontologia-input costo-concepto" value="${concepto}" placeholder="Descripción del servicio">
        </div>
        <div>
          <label class="odontologia-label">Costo ($)</label>
          <input type="number" class="odontologia-input costo-monto" value="${costo}" min="0" step="0.01" oninput="calcularTotalCostos()">
        </div>
      </div>
      <button type="button" class="btn-eliminar-costo" style="background: #e63946; color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-top: 0.5rem; cursor: pointer;">Eliminar</button>
    `;
    
    container.appendChild(item);
    
    // Agregar evento para eliminar
    item.querySelector('.btn-eliminar-costo').addEventListener('click', function() {
      if (document.querySelectorAll('.costo-item').length > 1) {
        item.remove();
        calcularTotalCostos();
      } else {
        alert('Debe haber al menos un costo');
      }
    });
    
    // Agregar evento para calcular total cuando cambie el monto
    item.querySelector('.costo-monto').addEventListener('input', calcularTotalCostos);
    
    calcularTotalCostos();
  };
  
  // Agregar primera fila por defecto
  agregarFilaCosto();
}

// Configurar botón para agregar costos
document.getElementById('agregar-costo').addEventListener('click', function() {
  agregarFilaCosto();
});

// Subir imágenes a Firebase Storage (FUNCIÓN MEJORADA)
async function subirImagenes(docId, files) {
  const urls = [];
  
  if (!files || files.length === 0) return urls;

  try {
    const user = await ensureAuth();
    
    let progressContainer = document.getElementById('upload-progress-container');
    if (!progressContainer) {
      progressContainer = document.createElement('div');
      progressContainer.id = 'upload-progress-container';
      progressContainer.style.marginTop = '1rem';
      progressContainer.style.padding = '1rem';
      progressContainer.style.background = '#f8f9fa';
      progressContainer.style.borderRadius = '8px';
      progressContainer.style.border = '1px solid #ddd';
      const form = document.getElementById('formPodologia');
      if (form) form.appendChild(progressContainer);
    }

    for (const file of files) {
      try {
        if (file.size > 5 * 1024 * 1024) continue;
        
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const path = `historial-podologia/${docId}/adjuntos/${fileName}`;
        const storageRef = storage.ref(path);

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

        const downloadURL = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              const progressText = progressElement.querySelector('.upload-progress');
              const progressBar = progressElement.querySelector('.upload-progress-bar');
              if (progressText) progressText.textContent = `${Math.round(progress)}%`;
              if (progressBar) progressBar.style.width = `${progress}%`;
            },
            (error) => {
              const statusSpan = progressElement.querySelector('.upload-status');
              if (statusSpan) statusSpan.textContent = '❌';
              progressElement.style.color = '#d32f2f';
              reject(error);
            },
            async () => {
              try {
                const url = await uploadTask.snapshot.ref.getDownloadURL();
                const statusSpan = progressElement.querySelector('.upload-status');
                if (statusSpan) statusSpan.textContent = '✅';
                progressElement.style.color = '#2e7d32';
                resolve(url);
              } catch (urlError) {
                const statusSpan = progressElement.querySelector('.upload-status');
                if (statusSpan) statusSpan.textContent = '⚠️';
                progressElement.style.color = '#f57c00';
                resolve(null);
              }
            }
          );
        });

        if (downloadURL) urls.push(downloadURL);

      } catch (error) {
        console.error(`Error procesando ${file.name}:`, error);
      }
    }

    return urls;

  } catch (authError) {
    throw new Error("No se pudo autenticar para subir imágenes: " + authError.message);
  }
}

// --- FUNCIÓN DE ENVIO DE FORMULARIO MEJORADA ---
document.getElementById('formPodologia').addEventListener('submit', async function(e) {
  e.preventDefault();

  const btnGuardar = document.getElementById('btnGuardar');
  const originalText = btnGuardar.textContent;
  btnGuardar.textContent = "Guardando...";
  btnGuardar.disabled = true;

  let statusDiv = document.getElementById('upload-status');
  if (!statusDiv) {
    statusDiv = document.createElement('div');
    statusDiv.id = 'upload-status';
    statusDiv.style.padding = '1rem';
    statusDiv.style.margin = '1rem 0';
    statusDiv.style.borderRadius = '8px';
    statusDiv.style.backgroundColor = '#f8f9fa';
    this.appendChild(statusDiv);
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
  }

  try {
    updateStatus("Iniciando proceso de guardado...", "info");
    
    await ensureAuth();
    updateStatus("Autenticación exitosa", "success");
    
    // OBTENER USUARIO CORRECTAMENTE
    const currentUser = auth.currentUser;
    const userId = currentUser ? currentUser.uid : "anonymous";
    const userEmail = currentUser ? (currentUser.email || "anonimo@ejemplo.com") : "anonimo@ejemplo.com";

    // Recopilar datos de costos
    const costos = [];
    let totalGeneral = 0;
    
    document.querySelectorAll('.costo-item').forEach(item => {
      const fecha = item.querySelector('.costo-fecha').value;
      const concepto = item.querySelector('.costo-concepto').value;
      const costo = parseFloat(item.querySelector('.costo-monto').value) || 0;
      
      if (fecha && concepto && costo > 0) {
        costos.push({ fecha, concepto, costo });
        totalGeneral += costo;
      }
    });
    
    // Recopilar datos del formulario
    const formData = {
      // Datos generales
      nombre: document.getElementById('nombre').value,
      sexo: document.getElementById('sexo').value,
      direccion: document.getElementById('direccion').value,
      email: document.getElementById('email').value,
      ocupacion: document.getElementById('ocupacion').value,
      telefono: document.getElementById('telefono').value,
      fecha: document.getElementById('fecha').value,
      edad: parseInt(document.getElementById('edad').value),
      estadoCivil: document.getElementById('estadoCivil').value,
      objetivoVisita: document.getElementById('objetivoVisita').value,
      alergias: document.getElementById('alergias').value,
      
      // Antecedentes médicos
      embarazo: document.querySelector('input[name="embarazo"]:checked')?.value || 'No',
      hipertension: document.querySelector('input[name="hipertension"]:checked').value,
      insuficienciaCardiaca: document.querySelector('input[name="insuficienciaCardiaca"]:checked').value,
      marcapasos: document.querySelector('input[name="marcapasos"]:checked').value,
      diabetes: document.querySelector('input[name="diabetes"]:checked').value,
      cancer: document.querySelector('input[name="cancer"]:checked').value,
      dermatitis: document.querySelector('input[name="dermatitis"]:checked').value,
      epilepsia: document.querySelector('input[name="epilepsia"]:checked').value,
      micosis: document.querySelector('input[name="micosis"]:checked').value,
      isquemias: document.querySelector('input[name="isquemias"]:checked').value,
      trombosis: document.querySelector('input[name="trombosis"]:checked').value,
      
      // Datos para mujeres
      usoTacon: document.querySelector('input[name="usoTacon"]:checked')?.value || 'No',
      alturaTacon: parseInt(document.getElementById('alturaTacon').value) || 0,
      horasUsoTacon: parseInt(document.getElementById('horasUsoTacon').value) || 0,
      diasTacon: parseInt(document.getElementById('diasTacon').value) || 0,
      
      // Exploración física
      peso: parseFloat(document.getElementById('peso').value) || 0,
      estatura: parseFloat(document.getElementById('estatura').value) || 0,
      imc: parseFloat(document.getElementById('imc').value) || 0,
      frecuenciaCardiaca: parseInt(document.getElementById('frecuenciaCardiaca').value) || 0,
      pulso: document.getElementById('pulso').value,
      temperatura: parseFloat(document.getElementById('temperatura').value) || 0,
      
      // Hábitos
      alcohol: document.getElementById('alcohol').value,
      cigarro: document.getElementById('cigarro').value,
      desvela: document.getElementById('desvela').value,
      agua: parseFloat(document.getElementById('agua').value) || 0,
      medicamentos: document.getElementById('medicamentos').value,
      calzado: document.getElementById('calzado').value,
      
      // Alimentación
      carne: document.getElementById('carne').value,
      pescado: document.getElementById('pescado').value,
      verduras: document.getElementById('verduras').value,
      frutas: document.getElementById('frutas').value,
      pan: document.getElementById('pan').value,
      ejercicio: document.getElementById('ejercicio').value,
      tipoEjercicio: document.getElementById('tipoEjercicio').value,
      frecuenciaEjercicio: parseInt(document.getElementById('frecuenciaEjercicio').value) || 0,
      cirugias: document.getElementById('cirugias').value,
      bebidas: document.getElementById('bebidas').value,
      frecuenciaBebidas: document.getElementById('frecuenciaBebidas').value,
      habitosLimpieza: document.getElementById('habitosLimpieza').value,
      productosEspecificos: document.getElementById('productosEspecificos').value,
      
      // Costos
      costos: costos,
      totalGeneral: totalGeneral,
      observaciones: document.getElementById('observaciones').value,
      
      // Metadata del usuario
      userId: userId,
      userEmail: userEmail,
      
      // Timestamps
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    updateStatus("Guardando datos principales...", "info");
    const docRef = await db.collection("historial-podologia").add(formData);
    updateStatus("Datos principales guardados correctamente", "success");

    // Subir imágenes
    const inputImgs = document.getElementById("imagenes");
    const files = inputImgs?.files ? Array.from(inputImgs.files) : [];
    
    if (files.length > 0) {
      updateStatus(`Subiendo ${files.length} imagen(es)...`, "info");
      try {
        const imageUrls = await subirImagenes(docRef.id, files);
        if (imageUrls.length > 0) {
          await docRef.update({ 
            imagenes: imageUrls,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp() 
          });
          updateStatus(`✅ ${imageUrls.length} imagen(es) subidas correctamente`, "success");
        } else {
          updateStatus("⚠️ No se subieron imágenes", "warning");
        }
      } catch (error) {
        updateStatus("⚠️ Error subiendo imágenes, pero los datos se guardaron", "warning");
      }
    } else {
      updateStatus("No hay imágenes para subir", "info");
    }

    updateStatus("✅ Proceso completado. Redirigiendo...", "success");
    setTimeout(() => {
      window.location.href = `preview-podologia.html?id=${docRef.id}`;
    }, 1500);

  } catch (error) {
    console.error('Error al guardar la ficha:', error);
    updateStatus(`Error: ${error.message}`, "error");
    alert("Ocurrió un error al guardar. Revisa la consola para más detalles.");
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = originalText;
  }
});

// Cargar datos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log("Formulario de podología cargado");
  
  // Autenticar inmediatamente al cargar la página
  ensureAuth().catch(error => {
    console.error("Error en autenticación inicial:", error);
  });
  
  // Configurar eventos para IMC
  document.getElementById('peso').addEventListener('input', calcularIMC);
  document.getElementById('estatura').addEventListener('input', calcularIMC);
  
  // Configurar sistema de costos
  setupCostos();
  
  // Establecer fecha actual por defecto
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('fecha').value = today;
});