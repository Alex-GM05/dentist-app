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

// Variables globales
let pacienteId = null;
let costos = [];
let abonos = [];
let imagenesExistentes = [];
let imagenesAEliminar = [];
let nuevasImagenes = [];

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
  document.getElementById('agregar-cargo').addEventListener('click', agregarCosto);
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

// Función para cargar los datos del paciente
async function cargarPaciente() {
  try {
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
    
    // Antecedentes médicos
    if (paciente.antecedentesMedicos) {
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
    }
    
    // Sección solo mujeres - LLAMAR A LA FUNCIÓN después de establecer el valor
    if (paciente.sexo === 'Mujer') {
      // Mostrar secciones de mujer
      toggleSeccionesMujer();
      
      // Llenar datos específicos de mujeres
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
    
    // Cargar imágenes existentes (si las hay)
    if (paciente.imagenes) {
      cargarImagenesExistentes(paciente.imagenes);
    }
    
    // Cargar cargos y abonos
    if (paciente.costos) {
      // Compatibilidad con ambos nombres (cargos o costos)
      costos = paciente.costos || [];
      renderCostos();
    }
    
    if (paciente.abonos) {
      abonos = paciente.abonos;
      renderAbonos();
    }
    
    // Calcular totales
    calcularTotales();
    
  } catch (error) {
    console.error('Error al cargar el paciente:', error);
    Swal.fire('Error', 'No se pudo cargar la información del paciente.', 'error');
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

// Calcular IMC automáticamente
function calcularIMC() {
  const peso = parseFloat(document.getElementById('peso').value) || 0;
  const estatura = parseFloat(document.getElementById('estatura').value) || 0;
  
  if (peso > 0 && estatura > 0) {
    const estaturaMetros = estatura / 100;
    const imc = peso / (estaturaMetros * estaturaMetros);
    document.getElementById('imc').value = imc.toFixed(2);
  } else {
    document.getElementById('imc').value = '';
  }
}

// AGREGAR NUEVO COSTO - FUNCIÓN NUEVA
function agregarCosto() {
  const nuevoCosto = {
    concepto: '',
    costo: 0,
    fecha: new Date().toISOString().split('T')[0] // Fecha actual por defecto
  };
  
  costos.push(nuevoCosto);
  renderCostos();
}

// RENDERIZAR COSTOS EXISTENTES - FUNCIÓN CORREGIDA
function renderCostos() {
  const contenedor = document.getElementById('costos-container');
  contenedor.innerHTML = '<h3>Costos (Tratamientos)</h3>';
  
  if (costos.length === 0) {
    contenedor.innerHTML += '<p>No hay costos registrados.</p>';
    return;
  }
  
  costos.forEach((costo, index) => {
    const costoDiv = document.createElement('div');
    costoDiv.className = 'costo-item';
    costoDiv.innerHTML = `
      <div class="grid-3" style="margin-bottom: 0.5rem;">
        <div>
          <input type="date" class="odontologia-input" 
                 value="${costo.fecha || new Date().toISOString().split('T')[0]}" 
                 oninput="costos[${index}].fecha = this.value">
        </div>
        <div>
          <input type="text" class="odontologia-input" placeholder="Concepto del costo" 
                 value="${costo.concepto || ''}" 
                 oninput="costos[${index}].concepto = this.value; calcularTotales()">
        </div>
        <div>
          <input type="number" class="odontologia-input" placeholder="Monto" min="0" step="0.01" 
                 value="${costo.costo || 0}" 
                 oninput="costos[${index}].costo = parseFloat(this.value) || 0; calcularTotales()">
        </div>
        <div>
          <button type="button" class="btn-eliminar" onclick="eliminarCostoExistente(${index})">❌</button>
        </div>
      </div>
    `;
    
    contenedor.appendChild(costoDiv);
  });
  
  calcularTotales();
}

// Función para eliminar cargos existentes
function eliminarCargoExistente(index) {
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
      cargos.splice(index, 1);
      renderCargos();
      Swal.fire('Eliminado', 'El cargo ha sido eliminado.', 'success');
    }
  });
}

// Agregar un nuevo cargo
function agregarCosto() {
  const nuevoCargo = {
    descripcion: '',
    monto: 0
  };
  
  cargos.push(nuevoCargo);
  renderCargos();
}

// ELIMINAR COSTO EXISTENTE - FUNCIÓN CORREGIDA
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

// AGREGAR ABONO - FUNCIÓN MEJORADA
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

// RENDERIZAR ABONOS - FUNCIÓN MEJORADA
function renderAbonos() {
  const contenedor = document.getElementById('abonos-container');
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

// CALCULAR TOTALES - FUNCIÓN CORREGIDA
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
  document.getElementById('totalCargos').textContent = totalCostos.toFixed(2);
  document.getElementById('totalAbonos').textContent = totalAbonos.toFixed(2);
  document.getElementById('saldoPendiente').textContent = saldoPendiente.toFixed(2);
  
  // Resaltar saldo pendiente
  const saldoElement = document.getElementById('saldoPendiente');
  if (saldoPendiente > 0) {
    saldoElement.parentElement.style.color = '#e63946';
    saldoElement.parentElement.style.fontWeight = 'bold';
  } else {
    saldoElement.parentElement.style.color = 'inherit';
    saldoElement.parentElement.style.fontWeight = 'inherit';
  }
}

// Función para cargar imágenes existentes
function cargarImagenesExistentes(imagenes) {
  const contenedor = document.getElementById('imagenes-existentes');
  contenedor.innerHTML = '';
  
  imagenesExistentes = imagenes || [];
  
  if (imagenesExistentes.length === 0) {
    contenedor.innerHTML = '<p>No hay imágenes registradas.</p>';
    return;
  }
  
  imagenesExistentes.forEach((imagen, index) => {
    const imagenDiv = document.createElement('div');
    imagenDiv.className = 'imagen-item';
    imagenDiv.innerHTML = `
      <img src="${imagen.url}" alt="Imagen del paciente">
      <button type="button" class="eliminar-imagen" onclick="marcarImagenParaEliminar(${index})">❌</button>
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
async function eliminarImagenesStorage() {
  for (const url of imagenesAEliminar) {
    try {
      // Verificar si es una URL completa o solo una ruta
      if (url.startsWith('http')) {
        // Es una URL completa - usar refFromURL
        const imagenRef = storage.refFromURL(url);
        await imagenRef.delete();
      } else {
        // Es solo una ruta - usar ref
        const imagenRef = storage.ref(url);
        await imagenRef.delete();
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
    }
  }
}

// Función para obtener el valor de un grupo de radio buttons
function getRadioValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : 'No';
}

// ACTUALIZAR PACIENTE - FUNCIÓN CORREGIDA
async function actualizarPaciente(e) {
  e.preventDefault();
  
  try {
    Swal.fire({
      title: 'Actualizando...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // 1. Eliminar imágenes marcadas para eliminar
    if (imagenesAEliminar.length > 0) {
      await eliminarImagenesStorage();
    }
    
    // 2. Subir nuevas imágenes
    let nuevasImagenesSubidas = [];
    if (nuevasImagenes.length > 0) {
      nuevasImagenesSubidas = await subirImagenes();
    }
    
    // 3. Preparar array final de imágenes
    const imagenesFinales = imagenesExistentes.filter((imagen, index) => {
      return !imagenesAEliminar.includes(imagen.url); // ← CORREGIR esto
    }).concat(nuevasImagenesSubidas);
    
    // 4. Obtener valores de cargos (existentes + nuevos)
    const nuevosCostos = [...costos]; // Copiar cargos existentes
    
    // Agregar cargos nuevos del formulario
    const elementosCostos = document.querySelectorAll('.costo-item');
    elementosCostos.forEach(item => {
      const descInput = item.querySelector('input[type="text"]');
      const montoInput = item.querySelector('input[type="number"]');
      
      if (descInput && descInput.value && montoInput && montoInput.value) {
        // Verificar si es un cargo nuevo (no existente)
        const esCostoNuevo = !descInput.id.startsWith('costo-desc-') || isNaN(parseInt(descInput.id.split('-')[2]));
        
        if (esCostoNuevo) {
          nuevosCostos.push({
            concepto: descInput.value,
            costo: parseFloat(montoInput.value)
          });
        }
      }
    });
    
    // 5. Preparar datos para actualizar
    const datosActualizados = {    
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
      alturaTacon: document.getElementById('alturaTacon').value,
      horasUsoTacon: document.getElementById('horasUsoTacon').value,
      diasTacon: document.getElementById('diasTacon').value,
      
      peso: parseFloat(document.getElementById('peso').value) || 0,
      estatura: parseFloat(document.getElementById('estatura').value) || 0,
      imc: document.getElementById('imc').value,
      frecuenciaCardiaca: document.getElementById('frecuenciaCardiaca').value,
      pulso: document.getElementById('pulso').value,
      temperatura: parseFloat(document.getElementById('temperatura').value) || 0,
      
      alcohol: document.getElementById('alcohol').value,
      cigarro: document.getElementById('cigarro').value,
      desvela: document.getElementById('desvela').value,
      agua: parseFloat(document.getElementById('agua').value) || 0,
      medicamentos: document.getElementById('medicamentos').value,
      calzado: document.getElementById('calzado').value,
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
      
      costos: nuevosCostos,
      abonos: abonos,
      imagenes: imagenesFinales,
      
      ultimaActualizacion: new Date()
    };
    
    // 6. Actualizar en Firebase
    await db.collection('historial-podologia').doc(pacienteId).update(datosActualizados);
    
    Swal.fire('Éxito', 'Historia podológica actualizada correctamente.', 'success')
      .then(() => {
        window.location.href = 'admin.html';
      });
      
  } catch (error) {
    console.error('Error al actualizar:', error);
    Swal.fire('Error', 'No se pudo actualizar la historia podológica.', 'error');
  }
}