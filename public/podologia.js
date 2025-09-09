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

// Enviar formulario
document.getElementById('formPodologia').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  try {
    await ensureAuth();
    
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
      embarazo: document.querySelector('input[name="embarazo"]:checked').value,
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
      usoTacon: document.querySelector('input[name="usoTacon"]:checked').value,
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
      
      // Costos y observaciones
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
  }
});

// Cargar datos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log("Formulario de podología cargado");
});