let idPeliculaAEliminar = null;

const modal = document.querySelector('.modal');
const btnCancelar = document.querySelector('#btn-cancelar-eliminar');
const btnConfirmarEliminar = document.querySelector('#btn-confirmar-eliminar');

btnCancelar.addEventListener('click', () => {
  modal.classList.add('oculto');
  idPeliculaAEliminar = null;
});

btnConfirmarEliminar.addEventListener('click', async () => {
  if (idPeliculaAEliminar === null) return;

  const respuestaEliminar = await fetch('/eliminar-pelicula', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: idPeliculaAEliminar })
  });

  if (respuestaEliminar.ok) {
    modal.classList.add('oculto');
    cargarPeliculas();
  }

  idPeliculaAEliminar = null;
});

async function cargarPeliculas() {
  const respuesta = await fetch('/api/peliculas');
  const peliculas = await respuesta.json();
  console.log(peliculas);

  const listaPeliculas = document.querySelector('#lista-peliculas');
  listaPeliculas.innerHTML = '';

  peliculas.forEach(pelicula => {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta-pelicula';
    tarjeta.dataset.id = pelicula.id;
    tarjeta.innerHTML = `
      <img src="${pelicula.imagen || '/img/pixaline-filmstrip-1174228_1280.png'}" class="poster-pelicula" alt="${pelicula.titulo}">
      <div class="info-pelicula">
        <h3><a href="https://www.google.com/search?q=${encodeURIComponent(`site:imdb.com/title ${pelicula.titulo}`)}" target="_blank" rel="noopener noreferrer">${pelicula.titulo}</a></h3>
        <p>${pelicula.director}</p>
        <p>${pelicula.anio}</p>
      </div>
      <div class="acciones-pelicula">
        <button class="btn-eliminar" data-id="${pelicula.id}"><i class="fa-solid fa-trash"></i></button>
        <button class="btn-editar" data-id="${pelicula.id}"><i class="fa-solid fa-pen"></i></button>
      </div>
    `;
    listaPeliculas.appendChild(tarjeta);

    const botonEliminar = tarjeta.querySelector('.btn-eliminar');
    botonEliminar.addEventListener('click', () => {
      idPeliculaAEliminar = Number(botonEliminar.dataset.id);
      modal.classList.remove('oculto');
    });

    const botonEditar = tarjeta.querySelector('.btn-editar');
    botonEditar.addEventListener('click', () => {
      const id = Number(botonEditar.dataset.id);
      const peliculaSeleccionada = peliculas.find(p => p.id === id);
      document.querySelector('form').action = '/editar-pelicula';
      document.querySelector('[name="id"]').value = peliculaSeleccionada.id;
      document.querySelector('#titulo').value = peliculaSeleccionada.titulo;
      document.querySelector('#director').value = peliculaSeleccionada.director;
      document.querySelector('#anio').value = peliculaSeleccionada.anio;
    });
  });
}

cargarPeliculas();