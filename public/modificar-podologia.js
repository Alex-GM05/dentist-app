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
let cargos = [];
let abonos = [];

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
  document.getElementById('agregar-cargo').addEventListener('click', agregarCargo);
  document.getElementById('agregar-abono').addEventListener('click', agregarAbono);
  document.getElementById('sexo').addEventListener('change', toggleSeccionesMujer);
  
  // Calcular IMC automáticamente
  document.getElementById('peso').addEventListener('input', calcularIMC);
  document.getElementById('estatura').addEventListener('input', calcularIMC);
  
  // Cargar datos del paciente
  cargarPaciente();
});

// Función para cargar los datos del paciente
async function cargarPaciente() {
  try {
    const docRef = db.collection('podologia').doc(pacienteId);
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
    
    // Cargar cargos y abonos
    if (paciente.cargos) {
      cargos = paciente.cargos;
      renderCargos();
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

// Agregar un nuevo cargo
function agregarCargo() {
  const contenedor = document.getElementById('cargos-container');
  
  const cargoId = Date.now(); // ID único basado en timestamp
  
  const cargoDiv = document.createElement('div');
  cargoDiv.className = 'cargo-item';
  cargoDiv.innerHTML = `
    <div class="grid-3" style="margin-bottom: 0.5rem;">
      <div>
        <input type="text" class="odontologia-input" placeholder="Descripción del cargo" id="cargo-desc-${cargoId}">
      </div>
      <div>
        <input type="number" class="odontologia-input" placeholder="Monto" min="0" step="0.01" id="cargo-monto-${cargoId}">
      </div>
      <div>
        <button type="button" class="btn-eliminar" onclick="eliminarCargo(${cargoId})">❌</button>
      </div>
    </div>
  `;
  
  contenedor.appendChild(cargoDiv);
}

// Eliminar un cargo
function eliminarCargo(id) {
  const cargoDiv = document.querySelector(`#cargos-container .cargo-item:nth-child(${Array.from(document.querySelectorAll('.cargo-item')).findIndex(el => el.innerHTML.includes(`cargo-desc-${id}`)) + 1})`);
  if (cargoDiv) {
    cargoDiv.remove();
    calcularTotales();
  }
}

// Renderizar cargos existentes
function renderCargos() {
  const contenedor = document.getElementById('cargos-container');
  contenedor.innerHTML = '<h3>Cargos (Tratamientos)</h3>';
  
  cargos.forEach((cargo, index) => {
    const cargoDiv = document.createElement('div');
    cargoDiv.className = 'cargo-item';
    cargoDiv.innerHTML = `
      <div class="grid-3" style="margin-bottom: 0.5rem;">
        <div>
          <input type="text" class="odontologia-input" placeholder="Descripción del cargo" value="${cargo.descripcion || ''}" id="cargo-desc-${index}">
        </div>
        <div>
          <input type="number" class="odontologia-input" placeholder="Monto" min="0" step="0.01" value="${cargo.monto || ''}" id="cargo-monto-${index}">
        </div>
        <div>
          <button type="button" class="btn-eliminar" onclick="eliminarCargo(${index})">❌</button>
        </div>
      </div>
    `;
    
    contenedor.appendChild(cargoDiv);
  });
}

// Agregar un nuevo abono
function agregarAbono() {
  Swal.fire({
    title: 'Agregar Abono',
    html:
      `<input id="swal-fecha" type="date" class="swal2-input" placeholder="Fecha" value="${new Date().toISOString().split('T')[0]}">` +
      `<input id="swal-concepto" type="text" class="swal2-input" placeholder="Concepto">` +
      `<input id="swal-cantidad" type="number" class="swal2-input" placeholder="Cantidad abonada" min="0" step="0.01">`,
    focusConfirm: false,
    preConfirm: () => {
      return {
        fecha: document.getElementById('swal-fecha').value,
        concepto: document.getElementById('swal-concepto').value,
        cantidad: parseFloat(document.getElementById('swal-cantidad').value)
      };
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const { fecha, concepto, cantidad } = result.value;
      
      if (!fecha || !concepto || isNaN(cantidad) || cantidad <= 0) {
        Swal.fire('Error', 'Todos los campos son obligatorios y la cantidad debe ser mayor a 0.', 'error');
        return;
      }
      
      // Agregar el abono
      abonos.push({
        fecha,
        concepto,
        cantidad
      });
      
      // Renderizar abonos y calcular totales
      renderAbonos();
      calcularTotales();
      
      Swal.fire('Éxito', 'Abono agregado correctamente.', 'success');
    }
  });
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

// Renderizar abonos existentes
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
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      ${abonos.map((abono, index) => `
        <tr>
          <td>${abono.fecha}</td>
          <td>${abono.concepto}</td>
          <td>$${abono.cantidad.toFixed(2)}</td>
          <td>
            <button type="button" class="btn-eliminar" onclick="eliminarAbono(${index})">❌</button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  contenedor.appendChild(tabla);
}

// Calcular totales de cargos y abonos
function calcularTotales() {
  // Calcular total de cargos
  let totalCargos = 0;
  const elementosCargos = document.querySelectorAll('.cargo-item');
  
  elementosCargos.forEach(item => {
    const montoInput = item.querySelector('input[type="number"]');
    if (montoInput && montoInput.value) {
      totalCargos += parseFloat(montoInput.value) || 0;
    }
  });
  
  // Calcular total de abonos
  const totalAbonos = abonos.reduce((total, abono) => total + (abono.cantidad || 0), 0);
  
  // Calcular saldo pendiente
  const saldoPendiente = totalCargos - totalAbonos;
  
  // Actualizar la UI
  document.getElementById('totalCargos').textContent = totalCargos.toFixed(2);
  document.getElementById('totalAbonos').textContent = totalAbonos.toFixed(2);
  document.getElementById('saldoPendiente').textContent = saldoPendiente.toFixed(2);
  
  // Resaltar saldo pendiente si es positivo
  const saldoElement = document.getElementById('saldoPendiente');
  if (saldoPendiente > 0) {
    saldoElement.parentElement.style.color = '#e63946';
    saldoElement.parentElement.style.fontWeight = 'bold';
  } else {
    saldoElement.parentElement.style.color = 'inherit';
    saldoElement.parentElement.style.fontWeight = 'inherit';
  }
}

// Actualizar paciente en Firebase
async function actualizarPaciente(e) {
  e.preventDefault();
  
  try {
    // Mostrar indicador de carga
    Swal.fire({
      title: 'Actualizando...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Obtener valores de cargos
    const nuevosCargos = [];
    const elementosCargos = document.querySelectorAll('.cargo-item');
    
    elementosCargos.forEach(item => {
      const descInput = item.querySelector('input[type="text"]');
      const montoInput = item.querySelector('input[type="number"]');
      
      if (descInput && descInput.value && montoInput && montoInput.value) {
        nuevosCargos.push({
          descripcion: descInput.value,
          monto: parseFloat(montoInput.value)
        });
      }
    });
    
    // Preparar datos para actualizar
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
      
      cargos: nuevosCargos,
      abonos: abonos,
      
      observaciones: document.getElementById('observaciones').value,
      
      ultimaActualizacion: new Date()
    };
    
    // Actualizar en Firebase
    await db.collection('podologia').doc(pacienteId).update(datosActualizados);
    
    Swal.fire('Éxito', 'Historia podológica actualizada correctamente.', 'success')
      .then(() => {
        window.location.href = 'admin.html';
      });
      
  } catch (error) {
    console.error('Error al actualizar:', error);
    Swal.fire('Error', 'No se pudo actualizar la historia podológica.', 'error');
  }
}

// Función para obtener el valor de un grupo de radio buttons
function getRadioValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : 'No';
}