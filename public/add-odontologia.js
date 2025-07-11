const db = firebase.firestore();
const formulario = document.getElementById('formularioOdontologia');

formulario.addEventListener('submit', async (e) => {
  e.preventDefault();

  const datos = Object.fromEntries(new FormData(formulario).entries());
  datos.fecha = new Date().toLocaleDateString();

  try {
    const docRef = await db.collection("historial-odontologia").add(datos);
    window.location.href = `preview-odontologia.html?id=${docRef.id}`;
  } catch (err) {
    alert("Error al guardar: " + err.message);
  }
});
