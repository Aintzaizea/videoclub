async function cargarPeliculas() {
  const respuesta = await fetch('/api/peliculas');
  const peliculas = await respuesta.json();
  console.log(peliculas);

  const listaPeliculas = document.querySelector('#lista-peliculas');

  peliculas.forEach(pelicula => {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta-pelicula';
  tarjeta.innerHTML = `
    <h3>${pelicula.titulo}</h3>
    <p>${pelicula.director}</p>
    <p>${pelicula.anio}</p>
    <div class="acciones-pelicula">
      <button class="btn-eliminar" data-id="${pelicula.id}"><i class="fa-solid fa-trash"></i></button>
      <button class="btn-editar" data-id="${pelicula.id}"><i class="fa-solid fa-pen"></i></button>
    </div>
  `;
  listaPeliculas.appendChild(tarjeta);

  const botonEliminar = tarjeta.querySelector('.btn-eliminar');
  botonEliminar.addEventListener('click', async () => {
    const id = botonEliminar.dataset.id;
    await fetch(`/eliminar-pelicula?id=${id}`, { method: 'DELETE' });
    tarjeta.remove();
  });
  const botonEditar = tarjeta.querySelector('.btn-editar');
  botonEditar.addEventListener('click', () => {
    const id = Number(botonEditar.dataset.id);
    const pelicula = peliculas.find(p => p.id === id);
    document.querySelector('form').action = '/editar-pelicula';
    document.querySelector('[name="id"]').value = pelicula.id;
    document.querySelector('#titulo').value = pelicula.titulo;
    document.querySelector('#director').value = pelicula.director;
    document.querySelector('#anio').value = pelicula.anio;
  });
});
}
cargarPeliculas();