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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// Para Firebase version 9+ usa esta sintaxis:
const storage = firebase.storage();

// AUTENTICACIÓN ANÓNIMA AUTOMÁTICA
firebase.auth().signInAnonymously()
  .then(() => {
    console.log('Autenticación anónima exitosa');
  })
  .catch((error) => {
    console.error('Error en autenticación anónima:', error);
    Swal.fire('Error', 'No se pudo inicializar la aplicación', 'error');
  });

// Opcional: Escuchar cambios de autenticación
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log('Usuario anónimo autenticado:', user.uid);
    // user.isAnonymous será true
  } else {
    console.log('Usuario no autenticado');
  }
});

// Variables globales
let pacienteId = null;
let costos = [];
let abonos = [];
let imagenesExistentes = [];
let imagenesAEliminar = [];
let nuevasImagenes = [];

// AGREGAR NUEVO COSTO - FUNCIÓN FALTANTE
function agregarCosto() {
  const nuevoCosto = {
    concepto: '',
    costo: 0,
    fecha: new Date().toISOString().split('T')[0]
  };
  
  costos.push(nuevoCosto);
  renderCostos();
}

// AGREGAR ABONO
function agregarAbono() {
  Swal.fire({
    title: 'Agregar Abono',
    html:
      `<input id="swal-fecha" type="date" class="swal2-input" placeholder="Fecha" value="${new Date().toISOString().split('T')[0]}">` +
      `<input id="swal-concepto" type="text" class="swal2-input" placeholder="Concepto">` +
      `<input id="swal-cantidad" type="number" class="swal2-input" placeholder="Cantidad abonada" min="0" step="0.01">` +
      `<select id="swal-metodo" class="swal2-input">
        <option value="efectivo">Efectivo</option>
        <option value="transferencia">Transferencia</option>
        <option value="tarjeta">Tarjeta</option>
      </select>`,
    focusConfirm: false,
    preConfirm: () => {
      return {
        fecha: document.getElementById('swal-fecha').value,
        concepto: document.getElementById('swal-concepto').value,
        cantidad: parseFloat(document.getElementById('swal-cantidad').value),
        metodo: document.getElementById('swal-metodo').value
      };
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const { fecha, concepto, cantidad, metodo } = result.value;
      
      if (!fecha || !concepto || isNaN(cantidad) || cantidad <= 0) {
        Swal.fire('Error', 'Todos los campos son obligatorios y la cantidad debe ser mayor a 0.', 'error');
        return;
      }
      
      abonos.push({
        fecha,
        concepto,
        cantidad,
        metodo
      });
      
      renderAbonos();
      calcularTotales();
      
      Swal.fire('Éxito', 'Abono agregado correctamente.', 'success');
    }
  });
}

// Función para mostrar/ocultar secciones de mujeres
function toggleSeccionesMujer() {
  const sexo = document.getElementById('sexo').value;
  const seccionMujeres = document.getElementById('seccion-mujeres');
  const seccionEmbarazo = document.getElementById('seccion-embarazo');
  
  if (sexo === 'Mujer') {
    seccionMujeres.classList.remove('seccion-oculta');
    seccionEmbarazo.classList.remove('seccion-oculta');
  } else {
    seccionMujeres.classList.add('seccion-oculta');
    seccionEmbarazo.classList.add('seccion-oculta');
  }
}

// Calcular IMC automáticamente (versión mejorada)
function calcularIMC() {
  const peso = parseFloat(document.getElementById('peso').value);
  const estatura = parseFloat(document.getElementById('estatura').value);
  
  if (peso > 0 && estatura > 0) {
    const estaturaMetros = estatura / 100;
    const imc = peso / (estaturaMetros * estaturaMetros);
    document.getElementById('imc').value = imc.toFixed(2);
  } else {
    document.getElementById('imc').value = '';
  }
}

// Cargar datos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Obtener ID del paciente desde la URL
  const urlParams = new URLSearchParams(window.location.search);
  pacienteId = urlParams.get('edit');
  
  if (!pacienteId) {
    Swal.fire('Error', 'No se ha especificado un paciente para editar.', 'error')
      .then(() => {
        window.location.href = 'admin.html';
      });
    return;
  }
  
  // Configurar eventos
  document.getElementById('formPodologia').addEventListener('submit', actualizarPaciente);
  document.getElementById('agregar-costo').addEventListener('click', agregarCosto);
  document.getElementById('agregar-abono').addEventListener('click', agregarAbono);
  document.getElementById('sexo').addEventListener('change', toggleSeccionesMujer);
  
  // Calcular IMC automáticamente
  document.getElementById('peso').addEventListener('input', calcularIMC);
  document.getElementById('estatura').addEventListener('input', calcularIMC);

  // Configurar evento para nuevas imágenes
  document.getElementById('nuevas-imagenes').addEventListener('change', manejarNuevasImagenes);
  
  // Cargar datos del paciente
  cargarPaciente();
});

// Función para cargar los datos del paciente - VERSIÓN MEJORADA
async function cargarPaciente() {
  try {
    console.log('Cargando paciente con ID:', pacienteId);
    
    const docRef = db.collection('historial-podologia').doc(pacienteId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      Swal.fire('Error', 'No se encontró el paciente especificado.', 'error')
        .then(() => {
          window.location.href = 'admin.html';
        });
      return;
    }
    
    const paciente = doc.data();
    console.log('Datos completos del paciente:', paciente);
    
    // Llenar campos del formulario
    document.getElementById('nombre').value = paciente.nombre || '';
    document.getElementById('sexo').value = paciente.sexo || '';
    document.getElementById('direccion').value = paciente.direccion || '';
    document.getElementById('email').value = paciente.email || '';
    document.getElementById('ocupacion').value = paciente.ocupacion || '';
    document.getElementById('telefono').value = paciente.telefono || '';
    document.getElementById('fecha').value = paciente.fecha || '';
    document.getElementById('edad').value = paciente.edad || '';
    document.getElementById('estadoCivil').value = paciente.estadoCivil || '';
    document.getElementById('objetivoVisita').value = paciente.objetivoVisita || '';
    document.getElementById('alergias').value = paciente.alergias || '';
    
    // Antecedentes médicos - VERIFICACIÓN MEJORADA
    if (paciente.antecedentesMedicos) {
      console.log('Antecedentes médicos:', paciente.antecedentesMedicos);
      setRadioValue('embarazo', paciente.antecedentesMedicos.embarazo);
      setRadioValue('hipertension', paciente.antecedentesMedicos.hipertension);
      setRadioValue('insuficienciaCardiaca', paciente.antecedentesMedicos.insuficienciaCardiaca);
      setRadioValue('marcapasos', paciente.antecedentesMedicos.marcapasos);
      setRadioValue('diabetes', paciente.antecedentesMedicos.diabetes);
      setRadioValue('cancer', paciente.antecedentesMedicos.cancer);
      setRadioValue('dermatitis', paciente.antecedentesMedicos.dermatitis);
      setRadioValue('epilepsia', paciente.antecedentesMedicos.epilepsia);
      setRadioValue('micosis', paciente.antecedentesMedicos.micosis);
      setRadioValue('isquemias', paciente.antecedentesMedicos.isquemias);
      setRadioValue('trombosis', paciente.antecedentesMedicos.trombosis);
    } else {
      console.log('No hay antecedentes médicos en el documento');
    }
    
    // Sección solo mujeres
    if (paciente.sexo === 'Mujer') {
      toggleSeccionesMujer();
      setRadioValue('usoTacon', paciente.usoTacon);
      document.getElementById('alturaTacon').value = paciente.alturaTacon || '';
      document.getElementById('horasUsoTacon').value = paciente.horasUsoTacon || '';
      document.getElementById('diasTacon').value = paciente.diasTacon || '';
    }
    
    // Exploración física
    document.getElementById('peso').value = paciente.peso || '';
    document.getElementById('estatura').value = paciente.estatura || '';
    document.getElementById('imc').value = paciente.imc || '';
    document.getElementById('frecuenciaCardiaca').value = paciente.frecuenciaCardiaca || '';
    document.getElementById('pulso').value = paciente.pulso || '';
    document.getElementById('temperatura').value = paciente.temperatura || '';
    
    // Hábitos y alimentación
    document.getElementById('alcohol').value = paciente.alcohol || '';
    document.getElementById('cigarro').value = paciente.cigarro || '';
    document.getElementById('desvela').value = paciente.desvela || '';
    document.getElementById('agua').value = paciente.agua || '';
    document.getElementById('medicamentos').value = paciente.medicamentos || '';
    document.getElementById('calzado').value = paciente.calzado || '';
    document.getElementById('carne').value = paciente.carne || '';
    document.getElementById('pescado').value = paciente.pescado || '';
    document.getElementById('verduras').value = paciente.verduras || '';
    document.getElementById('frutas').value = paciente.frutas || '';
    document.getElementById('pan').value = paciente.pan || '';
    document.getElementById('ejercicio').value = paciente.ejercicio || '';
    document.getElementById('tipoEjercicio').value = paciente.tipoEjercicio || '';
    document.getElementById('frecuenciaEjercicio').value = paciente.frecuenciaEjercicio || '';
    document.getElementById('cirugias').value = paciente.cirugias || '';
    document.getElementById('bebidas').value = paciente.bebidas || '';
    document.getElementById('frecuenciaBebidas').value = paciente.frecuenciaBebidas || '';
    document.getElementById('habitosLimpieza').value = paciente.habitosLimpieza || '';
    document.getElementById('productosEspecificos').value = paciente.productosEspecificos || '';
    
    // Observaciones
    document.getElementById('observaciones').value = paciente.observaciones || '';
    
    // Cargar imágenes existentes - MEJORADO
    if (paciente.imagenes && Array.isArray(paciente.imagenes) && paciente.imagenes.length > 0) {
      console.log('Imágenes encontradas:', paciente.imagenes.length);
      cargarImagenesExistentes(paciente.imagenes);
    } else {
      console.log('No hay imágenes en el documento');
      document.getElementById('imagenes-existentes').innerHTML = '<p>No hay imágenes registradas.</p>';
    }
    
    // Cargar costos - DETECCIÓN MEJORADA
    if (paciente.costos && Array.isArray(paciente.costos) && paciente.costos.length > 0) {
      console.log('Costos encontrados:', paciente.costos);
      costos = paciente.costos;
      renderCostos();
    } 
    // Compatibilidad con el nombre anterior "cargos"
    else if (paciente.cargos && Array.isArray(paciente.cargos) && paciente.cargos.length > 0) {
      console.log('Cargos encontrados (nombre antiguo):', paciente.cargos);
      // Convertir cargos a costos
      costos = paciente.cargos.map(cargo => ({
        concepto: cargo.descripcion || cargo.concepto || '',
        costo: cargo.monto || cargo.costo || 0,
        fecha: cargo.fecha || new Date().toISOString().split('T')[0]
      }));
      renderCostos();
    }
    else {
      console.log('No hay costos en el documento');
      costos = [];
      renderCostos();
    }
    
    // Cargar abonos
    if (paciente.abonos && Array.isArray(paciente.abonos) && paciente.abonos.length > 0) {
      console.log('Abonos encontrados:', paciente.abonos);
      abonos = paciente.abonos;
      renderAbonos();
    } else {
      console.log('No hay abonos en el documento');
      abonos = [];
      renderAbonos();
    }
    
    // Calcular totales
    calcularTotales();
    
  } catch (error) {
    console.error('Error al cargar el paciente:', error);
    Swal.fire('Error', 'No se pudo cargar la información del paciente: ' + error.message, 'error');
  }
}

// Función para establecer valores de radio buttons
function setRadioValue(name, value) {
  if (!value) return;
  
  const radios = document.querySelectorAll(`input[name="${name}"]`);
  for (const radio of radios) {
    if (radio.value === value) {
      radio.checked = true;
      break;
    }
  }
}

// RENDERIZAR COSTOS EXISTENTES - VERSIÓN MEJORADA
function renderCostos() {
  const contenedor = document.getElementById('costos-container');
  if (!contenedor) {
    console.error('No se encontró el contenedor de costos');
    return;
  }
  
  contenedor.innerHTML = '<h3>Costos (Tratamientos)</h3>';
  
  if (costos.length === 0) {
    contenedor.innerHTML += '<p>No hay costos registrados.</p>';
    return;
  }
  
  costos.forEach((costo, index) => {
    const costoDiv = document.createElement('div');
    costoDiv.className = 'costo-item';
    costoDiv.innerHTML = `
      <div class="grid-4" style="margin-bottom: 1rem; gap: 10px; align-items: end;">
        <div>
          <label class="odontologia-label">Fecha</label>
          <input type="date" class="odontologia-input" 
                 value="${costo.fecha || new Date().toISOString().split('T')[0]}" 
                 oninput="costos[${index}].fecha = this.value">
        </div>
        <div>
          <label class="odontologia-label">Concepto</label>
          <input type="text" class="odontologia-input" placeholder="Concepto del costo" 
                 value="${costo.concepto || ''}" 
                 oninput="costos[${index}].concepto = this.value; calcularTotales()">
        </div>
        <div>
          <label class="odontologia-label">Monto ($)</label>
          <input type="number" class="odontologia-input" placeholder="Monto" min="0" step="0.01" 
                 value="${costo.costo || 0}" 
                 oninput="costos[${index}].costo = parseFloat(this.value) || 0; calcularTotales()">
        </div>
        <div>
          <button type="button" class="btn-eliminar" onclick="eliminarCostoExistente(${index})" style="margin-top: 24px;">❌ Eliminar</button>
        </div>
      </div>
    `;
    
    contenedor.appendChild(costoDiv);
  });
  
  calcularTotales();
}

// ELIMINAR COSTO EXISTENTE
function eliminarCostoExistente(index) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      costos.splice(index, 1);
      renderCostos();
      Swal.fire('Eliminado', 'El costo ha sido eliminado.', 'success');
    }
  });
}

// RENDERIZAR ABONOS
function renderAbonos() {
  const contenedor = document.getElementById('abonos-container');
  if (!contenedor) {
    console.error('No se encontró el contenedor de abonos');
    return;
  }
  
  contenedor.innerHTML = '<h3 style="margin-top: 2rem;">Abonos (Pagos realizados)</h3>';
  
  if (abonos.length === 0) {
    contenedor.innerHTML += '<p>No hay abonos registrados.</p>';
    return;
  }
  
  const tabla = document.createElement('table');
  tabla.className = 'abonos-table';
  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Concepto</th>
        <th>Cantidad</th>
        <th>Método</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      ${abonos.map((abono, index) => `
        <tr>
          <td>${abono.fecha}</td>
          <td>${abono.concepto}</td>
          <td>$${abono.cantidad.toFixed(2)}</td>
          <td>${abono.metodo || 'efectivo'}</td>
          <td>
            <button type="button" class="btn-eliminar" onclick="eliminarAbono(${index})">❌</button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  contenedor.appendChild(tabla);
}

// Eliminar un abono
function eliminarAbono(index) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      abonos.splice(index, 1);
      renderAbonos();
      calcularTotales();
      Swal.fire('Eliminado', 'El abono ha sido eliminado.', 'success');
    }
  });
}

// CALCULAR TOTALES
function calcularTotales() {
  // Calcular total de costos
  let totalCostos = costos.reduce((total, costo) => {
    return total + (parseFloat(costo.costo) || 0);
  }, 0);
  
  // Calcular total de abonos
  const totalAbonos = abonos.reduce((total, abono) => {
    return total + (parseFloat(abono.cantidad) || 0);
  }, 0);
  
  // Calcular saldo pendiente
  const saldoPendiente = totalCostos - totalAbonos;
  
  // Actualizar la UI
  const totalCargosElement = document.getElementById('totalCargos');
  const totalAbonosElement = document.getElementById('totalAbonos');
  const saldoPendienteElement = document.getElementById('saldoPendiente');
  
  if (totalCargosElement) totalCargosElement.textContent = totalCostos.toFixed(2);
  if (totalAbonosElement) totalAbonosElement.textContent = totalAbonos.toFixed(2);
  if (saldoPendienteElement) {
    saldoPendienteElement.textContent = saldoPendiente.toFixed(2);
    
    // Resaltar saldo pendiente
    if (saldoPendiente > 0) {
      saldoPendienteElement.parentElement.style.color = '#e63946';
      saldoPendienteElement.parentElement.style.fontWeight = 'bold';
    } else {
      saldoPendienteElement.parentElement.style.color = 'inherit';
      saldoPendienteElement.parentElement.style.fontWeight = 'inherit';
    }
  }
}

// Función para cargar imágenes existentes
function cargarImagenesExistentes(imagenes) {
  const contenedor = document.getElementById('imagenes-existentes');
  if (!contenedor) {
    console.error('No se encontró el contenedor de imágenes');
    return;
  }
  
  contenedor.innerHTML = '';
  imagenesExistentes = imagenes;
  
  if (imagenesExistentes.length === 0) {
    contenedor.innerHTML = '<p>No hay imágenes registradas.</p>';
    return;
  }
  
  imagenesExistentes.forEach((imagen, index) => {
    const imagenDiv = document.createElement('div');
    imagenDiv.className = 'imagen-item';
    imagenDiv.style.position = 'relative';
    imagenDiv.style.margin = '10px';
    imagenDiv.innerHTML = `
      <img src="${imagen.url}" alt="Imagen del paciente" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px;">
      <button type="button" class="eliminar-imagen" 
              onclick="marcarImagenParaEliminar(${index})"
              style="position: absolute; top: 5px; right: 5px; background: #e63946; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">
        ❌
      </button>
    `;
    contenedor.appendChild(imagenDiv);
  });
}

// Función para marcar imágenes para eliminar
function marcarImagenParaEliminar(index) {
  Swal.fire({
    title: '¿Eliminar imagen?',
    text: "Esta acción no se puede deshacer.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      // Agregar a la lista de imágenes a eliminar
      imagenesAEliminar.push(imagenesExistentes[index].url);
      
      // Eliminar del DOM
      document.querySelectorAll('.imagen-item')[index].remove();
      
      Swal.fire('Eliminada', 'La imagen se eliminará al guardar los cambios.', 'success');
    }
  });
}

// Función para manejar nuevas imágenes
function manejarNuevasImagenes(e) {
  const files = e.target.files;
  const previewContainer = document.getElementById('preview-nuevas-imagenes');
  previewContainer.innerHTML = '';
  
  nuevasImagenes = []; // Reiniciar array
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const previewDiv = document.createElement('div');
      previewDiv.className = 'imagen-preview';
      previewDiv.innerHTML = `
        <img src="${e.target.result}" alt="Vista previa">
        <button type="button" class="eliminar-preview" onclick="eliminarPreview(this)">❌</button>
      `;
      previewContainer.appendChild(previewDiv);
      
      // Guardar referencia al archivo
      nuevasImagenes.push({
        file: file,
        preview: e.target.result
      });
    };
    
    reader.readAsDataURL(file);
  }
}

// Función para eliminar vista previa
function eliminarPreview(boton) {
  const previewDiv = boton.parentElement;
  const index = Array.from(previewDiv.parentElement.children).indexOf(previewDiv);
  
  // Eliminar de nuevasImagenes
  nuevasImagenes.splice(index, 1);
  
  // Eliminar del DOM
  previewDiv.remove();
}

// Función para subir imágenes a Firebase Storage
async function subirImagenes() {
  const imagenesSubidas = [];
  
  for (const imagen of nuevasImagenes) {
    try {
      // Crear referencia en Storage
      const storageRef = firebase.storage().ref();
      const imagenRef = storageRef.child(`historial-podologia/${pacienteId}/${Date.now()}_${imagen.file.name}`);
      
      // Subir imagen
      const snapshot = await imagenRef.put(imagen.file);
      
      // Obtener URL de descarga
      const downloadURL = await snapshot.ref.getDownloadURL();
      
      imagenesSubidas.push({
        url: downloadURL,
        nombre: imagen.file.name,
        fecha: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al subir imagen:', error);
    }
  }
  
  return imagenesSubidas;
}

// Función para eliminar imágenes de Firebase Storage
function eliminarImagenesStorage(imagenesAEliminar) {
  if (!imagenesAEliminar || !Array.isArray(imagenesAEliminar)) {
    console.log('No hay imágenes para eliminar');
    return Promise.resolve();
  }

  const promesasEliminacion = imagenesAEliminar.map(imagenUrl => {
    // Validación más estricta
    if (!imagenUrl || typeof imagenUrl !== 'string' || !imagenUrl.startsWith('https://firebasestorage.googleapis.com/')) {
      console.log('URL omitida (inválida):', imagenUrl);
      return Promise.resolve();
    }

    try {
      const imagenRef = storage.refFromURL(imagenUrl);
      return imagenRef.delete()
        .then(() => console.log('Imagen eliminada:', imagenUrl))
        .catch(error => {
          console.error('Error al eliminar imagen:', error);
          return Promise.resolve(); // No romper la cadena de promesas
        });
    } catch (error) {
      console.error('Error procesando URL:', error);
      return Promise.resolve();
    }
  });

  return Promise.all(promesasEliminacion);
}

// Función para obtener el valor de un grupo de radio buttons
function getRadioValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : 'No';
}

// ACTUALIZAR PACIENTE - VERSIÓN COMPLETAMENTE CORREGIDA
async function actualizarPaciente(e) {
  e.preventDefault();
  
  // VERIFICAR SI HAY USUARIO AUTENTICADO (ANÓNIMO O NO)
  const user = firebase.auth().currentUser;
  if (!user) {
    // Intentar autenticar anónimamente justo antes de la operación
    try {
      await firebase.auth().signInAnonymously();
      console.log('Autenticado anónimamente para la operación');
    } catch (authError) {
      Swal.fire('Error de autenticación', 'No se pudo autenticar para realizar la operación', 'error');
      return;
    }
  }
  
  try {
    Swal.fire({
      title: 'Actualizando...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // 1. FILTRAR imágenes válidas para eliminar (CORRECCIÓN IMPORTANTE)
    const imagenesValidasAEliminar = imagenesAEliminar.filter(url => 
      url && typeof url === 'string' && url.startsWith('https://firebasestorage.googleapis.com/')
    );
    
    // Eliminar solo las imágenes válidas
    if (imagenesValidasAEliminar.length > 0) {
      await eliminarImagenesStorage(imagenesValidasAEliminar);
    }
    
    // 2. Subir nuevas imágenes
    let nuevasImagenesSubidas = [];
    if (nuevasImagenes.length > 0) {
      nuevasImagenesSubidas = await subirImagenes();
    }
    
    // 3. Preparar array final de imágenes
    const imagenesFinales = imagenesExistentes.filter(imagen => 
      imagen && imagen.url && !imagenesAEliminar.includes(imagen.url)
    ).concat(nuevasImagenesSubidas);
    
    // 4. Preparar datos para actualizar
    const datosActualizados = {
      nombre: document.getElementById('nombre').value || '',
      sexo: document.getElementById('sexo').value || '',
      direccion: document.getElementById('direccion').value || '',
      email: document.getElementById('email').value || '',
      ocupacion: document.getElementById('ocupacion').value || '',
      telefono: document.getElementById('telefono').value || '',
      fecha: document.getElementById('fecha').value || '',
      edad: parseInt(document.getElementById('edad').value) || 0,
      estadoCivil: document.getElementById('estadoCivil').value || '',
      objetivoVisita: document.getElementById('objetivoVisita').value || '',
      alergias: document.getElementById('alergias').value || '',
      
      antecedentesMedicos: {
        embarazo: getRadioValue('embarazo'),
        hipertension: getRadioValue('hipertension'),
        insuficienciaCardiaca: getRadioValue('insuficienciaCardiaca'),
        marcapasos: getRadioValue('marcapasos'),
        diabetes: getRadioValue('diabetes'),
        cancer: getRadioValue('cancer'),
        dermatitis: getRadioValue('dermatitis'),
        epilepsia: getRadioValue('epilepsia'),
        micosis: getRadioValue('micosis'),
        isquemias: getRadioValue('isquemias'),
        trombosis: getRadioValue('trombosis')
      },
      
      usoTacon: getRadioValue('usoTacon'),
      alturaTacon: document.getElementById('alturaTacon').value || '',
      horasUsoTacon: document.getElementById('horasUsoTacon').value || '',
      diasTacon: document.getElementById('diasTacon').value || '',
      
      peso: parseFloat(document.getElementById('peso').value) || 0,
      estatura: parseFloat(document.getElementById('estatura').value) || 0,
      imc: document.getElementById('imc').value || '',
      frecuenciaCardiaca: document.getElementById('frecuenciaCardiaca').value || '',
      pulso: document.getElementById('pulso').value || '',
      temperatura: parseFloat(document.getElementById('temperatura').value) || 0,
      
      alcohol: document.getElementById('alcohol').value || '',
      cigarro: document.getElementById('cigarro').value || '',
      desvela: document.getElementById('desvela').value || '',
      agua: parseFloat(document.getElementById('agua').value) || 0,
      medicamentos: document.getElementById('medicamentos').value || '',
      calzado: document.getElementById('calzado').value || '',
      carne: document.getElementById('carne').value || '',
      pescado: document.getElementById('pescado').value || '',
      verduras: document.getElementById('verduras').value || '',
      frutas: document.getElementById('frutas').value || '',
      pan: document.getElementById('pan').value || '',
      ejercicio: document.getElementById('ejercicio').value || '',
      tipoEjercicio: document.getElementById('tipoEjercicio').value || '',
      frecuenciaEjercicio: parseInt(document.getElementById('frecuenciaEjercicio').value) || 0,
      cirugias: document.getElementById('cirugias').value || '',
      bebidas: document.getElementById('bebidas').value || '',
      frecuenciaBebidas: document.getElementById('frecuenciaBebidas').value || '',
      habitosLimpieza: document.getElementById('habitosLimpieza').value || '',
      productosEspecificos: document.getElementById('productosEspecificos').value || '',
      
      costos: costos,
      abonos: abonos,
      imagenes: imagenesFinales,
      ultimaActualizacion: new Date()
    };
    
    // 5. VERIFICAR PERMISOS ANTES DE ACTUALIZAR
    console.log("Intentando actualizar paciente:", pacienteId);
    console.log("Datos a actualizar:", datosActualizados);
    
    // Intenta una operación simple primero para verificar permisos
    try {
      const testRef = db.collection('historial-podologia').doc(pacienteId);
      const testDoc = await testRef.get();
      
      if (!testDoc.exists) {
        throw new Error("El documento no existe");
      }
      
      // Verificar si tenemos permisos de escritura
      await testRef.update({ ultimaActualizacion: new Date() });
      
    } catch (permError) {
      console.error("Error de permisos:", permError);
      throw new Error(`Error de permisos: ${permError.message}. Contacta al administrador.`);
    }
    
    // 6. ACTUALIZACIÓN PRINCIPAL
    await db.collection('historial-podologia').doc(pacienteId).update(datosActualizados);
    
    Swal.fire('Éxito', 'Historia podológica actualizada correctamente.', 'success')
      .then(() => {
        window.location.href = 'admin.html';
      });
      
  } catch (error) {
    console.error('Error completo al actualizar:', error);
    
    // Manejo específico de errores
    if (error.message.includes('permission-denied') || error.message.includes('permisos')) {
      Swal.fire({
        title: 'Error de permisos',
        html: `No tienes permisos para actualizar este documento.<br><br>
               <strong>Posibles soluciones:</strong><br>
               1. Verifica que estés autenticado<br>
               2. Contacta al administrador<br>
               3. Revisa las reglas de Firestore`,
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    } else if (error.message.includes('documento no existe')) {
      Swal.fire('Error', 'El paciente que intentas editar ya no existe.', 'error');
    } else {
      Swal.fire('Error', 'No se pudo actualizar la historia podológica: ' + error.message, 'error');
    }
  }
}