let idPeliculaAEliminar = null;

const modal = document.querySelector('.modal');
const btnCancelar = document.querySelector('#btn-cancelar-eliminar');
const btnConfirmarEliminar = document.querySelector('#btn-confirmar-eliminar');

const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
const lightboxImg = document.createElement('img');
lightbox.appendChild(lightboxImg);
document.body.appendChild(lightbox);

lightbox.addEventListener('click', () => {
  lightbox.classList.remove('open');
});

btnCancelar.addEventListener('click', () => {
  modal.classList.add('oculto');
  idPeliculaAEliminar = null;
});

btnConfirmarEliminar.addEventListener('click', async () => {
  if (idPeliculaAEliminar === null) return;

  const respuestaEliminar = await fetch('/eliminar-pelicula', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: idPeliculaAEliminar })
  });

  if (respuestaEliminar.ok) {
    modal.classList.add('oculto');
    cargarPeliculas();
  }

  idPeliculaAEliminar = null;
});

// ---- PAGINACIÓN ----
const PELICULAS_POR_PAGINA = 12;

// Aquí guardamos TODAS las películas que vienen del backend, una sola vez.
// pintarPagina() trabaja siempre sobre esta copia, sin volver a pedir al servidor.
let todasLasPeliculas = [];
let paginaActual = 1;

async function cargarPeliculas() {
  const respuesta = await fetch('/api/peliculas');
  todasLasPeliculas = await respuesta.json();

  // Si al eliminar la última película de una página nos quedamos en una
  // página que ya no existe, retrocedemos automáticamente.
  const totalPaginas = Math.max(1, Math.ceil(todasLasPeliculas.length / PELICULAS_POR_PAGINA));
  if (paginaActual > totalPaginas) {
    paginaActual = totalPaginas;
  }

  pintarPagina(paginaActual);
}

function pintarPagina(numeroPagina) {
  paginaActual = numeroPagina;

  const listaPeliculas = document.querySelector('#lista-peliculas');
  listaPeliculas.innerHTML = '';

  // Calculamos qué "trozo" del array corresponde a esta página.
  // Página 1 -> índices 0 a 11, página 2 -> 12 a 23, etc.
  const indiceInicio = (numeroPagina - 1) * PELICULAS_POR_PAGINA;
  const indiceFin = indiceInicio + PELICULAS_POR_PAGINA;
  const peliculasDeEstaPagina = todasLasPeliculas.slice(indiceInicio, indiceFin);

  peliculasDeEstaPagina.forEach(pelicula => {
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

    const imagenPelicula = tarjeta.querySelector('.poster-pelicula');
    imagenPelicula.addEventListener('click', () => {
      lightboxImg.src = imagenPelicula.src;
      lightbox.classList.add('open');
    });

    const botonEliminar = tarjeta.querySelector('.btn-eliminar');
    botonEliminar.addEventListener('click', () => {
      idPeliculaAEliminar = Number(botonEliminar.dataset.id);
      modal.classList.remove('oculto');
    });

    const botonEditar = tarjeta.querySelector('.btn-editar');
    botonEditar.addEventListener('click', () => {
      const id = Number(botonEditar.dataset.id);
      // Buscamos en todasLasPeliculas (no en peliculasDeEstaPagina),
      // porque queremos poder editar cualquier película, no solo las de la página visible.
      const peliculaSeleccionada = todasLasPeliculas.find(p => p.id === id);
      document.querySelector('form').action = '/editar-pelicula';
      document.querySelector('[name="id"]').value = peliculaSeleccionada.id;
      document.querySelector('#titulo').value = peliculaSeleccionada.titulo;
      document.querySelector('#director').value = peliculaSeleccionada.director;
      document.querySelector('#anio').value = peliculaSeleccionada.anio;
    });
  });

  pintarControlesPaginacion();
}

function pintarControlesPaginacion() {
  const contenedorPaginacion = document.querySelector('#paginacion');
  contenedorPaginacion.innerHTML = '';

  const totalPaginas = Math.ceil(todasLasPeliculas.length / PELICULAS_POR_PAGINA);

  // Si solo hay una página (o ninguna), no merece la pena mostrar controles.
  if (totalPaginas <= 1) return;

  // Botón "Anterior"
  const btnAnterior = document.createElement('button');
  btnAnterior.textContent = '←';
  btnAnterior.disabled = paginaActual === 1;
  btnAnterior.addEventListener('click', () => pintarPagina(paginaActual - 1));
  contenedorPaginacion.appendChild(btnAnterior);

  // Un botón numerado por cada página.
  for (let i = 1; i <= totalPaginas; i++) {
    const btnPagina = document.createElement('button');
    btnPagina.textContent = i;
    if (i === paginaActual) {
      btnPagina.classList.add('pagina-activa');
    }
    btnPagina.addEventListener('click', () => pintarPagina(i));
    contenedorPaginacion.appendChild(btnPagina);
  }

  // Botón "Siguiente"
  const btnSiguiente = document.createElement('button');
  btnSiguiente.textContent = '→';
  btnSiguiente.disabled = paginaActual === totalPaginas;
  btnSiguiente.addEventListener('click', () => pintarPagina(paginaActual + 1));
  contenedorPaginacion.appendChild(btnSiguiente);
}

cargarPeliculas();