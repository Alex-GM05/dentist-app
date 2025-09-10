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

// Función para autenticación anónima
async function ensureAuth() {
  return new Promise((resolve, reject) => {
    const user = auth.currentUser;
    
    if (user) {
      console.log("Usuario ya autenticado:", user.uid);
      resolve(user);
      return;
    }
    
    console.log("Iniciando autenticación anónima para podología...");
    
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

document.getElementById('peso').addEventListener('input', calcularIMC);
document.getElementById('estatura').addEventListener('input', calcularIMC);

// Agregar más campos de costo
document.getElementById('agregar-costo').addEventListener('click', function() {
  const container = document.getElementById('costos-container');
  const newItem = document.createElement('div');
  newItem.className = 'costo-item';
  newItem.innerHTML = `
    <div class="grid-3" style="margin-top: 1rem;">
      <div>
        <label class="odontologia-label">Fecha</label>
        <input type="date" class="odontologia-input costo-fecha">
      </div>
      <div>
        <label class="odontologia-label">Concepto</label>
        <input type="text" class="odontologia-input costo-concepto">
      </div>
      <div>
        <label class="odontologia-label">Costo ($)</label>
        <input type="number" class="odontologia-input costo-monto" min="0" step="0.01">
      </div>
    </div>
    <button type="button" class="btn-eliminar-costo" style="background: #e63946; color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-top: 0.5rem; cursor: pointer;">Eliminar</button>
  `;
  
  container.appendChild(newItem);
  
  // Agregar evento para eliminar
  newItem.querySelector('.btn-eliminar-costo').addEventListener('click', function() {
    if (document.querySelectorAll('.costo-item').length > 1) {
      newItem.remove();
    } else {
      alert('Debe haber al menos un costo');
    }
  });
});

// Subir imágenes a Firebase Storage
async function subirImagenes() {
  const fileInput = document.getElementById('imagenes');
  const files = fileInput.files;
  const imageUrls = [];
  
  if (files.length === 0) {
    return imageUrls;
  }
  
  // Mostrar contenedor de progreso
  const progressContainer = document.getElementById('progress-container');
  const uploadProgress = document.getElementById('upload-progress');
  uploadProgress.style.display = 'block';
  progressContainer.innerHTML = '';
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.type.match('image.*')) continue;
    
    // Crear elemento de progreso para esta imagen
    const progressDiv = document.createElement('div');
    progressDiv.innerHTML = `
      <p>Subiendo: ${file.name}</p>
      <div class="progress-bar">
        <div class="progress-bar-fill" id="progress-${i}"></div>
      </div>
      <span id="status-${i}">0%</span>
    `;
    progressContainer.appendChild(progressDiv);
    
    try {
      // Subir archivo a Firebase Storage
      const storageRef = storage.ref();
      const imageRef = storageRef.child(`podologia/${Date.now()}_${file.name}`);
      const uploadTask = imageRef.put(file);
      
      // Esperar a que se complete la subida
      const snapshot = await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Actualizar progreso
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            document.getElementById(`progress-${i}`).style.width = progress + '%';
            document.getElementById(`status-${i}`).textContent = Math.round(progress) + '%';
          },
          (error) => reject(error),
          () => resolve(uploadTask.snapshot)
        );
      });
      
      // Obtener URL de descarga
      const downloadURL = await snapshot.ref.getDownloadURL();
      imageUrls.push({
        name: file.name,
        url: downloadURL
      });
      
      // Marcar como completado
      document.getElementById(`status-${i}`).textContent = '✓ Completado';
      
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      document.getElementById(`status-${i}`).textContent = '✗ Error: ' + error.message;
      throw error;
    }
  }
  
  return imageUrls;
}

// Enviar formulario
document.getElementById('formPodologia').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const btnGuardar = document.getElementById('btnGuardar');
  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando...';
  
  try {
    await ensureAuth();
    
    // Subir imágenes primero
    let imagenes = [];
    try {
      imagenes = await subirImagenes();
    } catch (error) {
      console.warn('Error subiendo imágenes, continuando sin ellas:', error);
    }
    
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
      
      // Imágenes y costos
      imagenes: imagenes,
      costos: costos,
      totalGeneral: totalGeneral,
      observaciones: document.getElementById('observaciones').value,
      
      // Metadata
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Guardar en Firestore
    const docRef = await db.collection('historial-podologia').add(formData);
    console.log('Documento guardado con ID:', docRef.id);
    
    alert('✅ Ficha de podología guardada correctamente');
    window.location.href = `preview-podologia.html?id=${docRef.id}`;
    
  } catch (error) {
    console.error('Error al guardar la ficha:', error);
    alert('❌ Error al guardar: ' + error.message);
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar Historia';
  }
});

// Cargar datos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log("Formulario de podología cargado");
});