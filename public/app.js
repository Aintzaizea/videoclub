// ---- ESTADO Y REFERENCIAS GLOBALES DEL MODAL DE ELIMINAR ----
// Guarda el id de la película pendiente de eliminar mientras el modal está abierto.
// Se declara fuera de cualquier función para que tanto el botón "eliminar" de cada
// tarjeta como los botones del modal puedan leerla y modificarla.
let idPeliculaAEliminar = null;

// Estas referencias se seleccionan UNA sola vez, al cargar el script.
// Si estuvieran dentro de cargarPeliculas(), cada repintado de la lista
// volvería a registrar los listeners de abajo, duplicándolos.
const modal = document.querySelector('.modal');
const btnCancelar = document.querySelector('#btn-cancelar-eliminar');
const btnConfirmarEliminar = document.querySelector('#btn-confirmar-eliminar');

// ---- LIGHTBOX PARA AMPLIAR EL PÓSTER ----
// Se crea un único <div class="lightbox"> por código y se añade al final del <body>.
// Servirá como overlay que muestra la imagen en grande al hacer clic en un póster.
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';

// Dentro del lightbox va una única <img>, que reutilizaremos para
// mostrar la imagen que se haya pinchado (cambiando su "src" cada vez).
const lightboxImg = document.createElement('img');
lightbox.appendChild(lightboxImg);
document.body.appendChild(lightbox);

// Al hacer clic en cualquier parte del lightbox (el overlay), se cierra
// quitando la clase "open" (esa clase es la que lo hace visible vía CSS).
lightbox.addEventListener('click', () => {
  lightbox.classList.remove('open');
});

// ---- LISTENERS DEL MODAL DE CONFIRMAR ELIMINAR ----

// Botón "Cancelar": cierra el modal (clase "oculto") y resetea el id pendiente,
// para que no quede guardado ningún id "a medias" si se reabre el modal luego.
btnCancelar.addEventListener('click', () => {
  modal.classList.add('oculto');
  idPeliculaAEliminar = null;
});

// Botón "Eliminar" (confirmar dentro del modal): hace la petición real al backend.
btnConfirmarEliminar.addEventListener('click', async () => {
  // Seguridad extra: si por algún motivo no hay id guardado, no hace nada.
  if (idPeliculaAEliminar === null) return;

  // Petición DELETE al backend, mandando el id en el cuerpo como JSON.
  const respuestaEliminar = await fetch('/eliminar-pelicula', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: idPeliculaAEliminar })
  });

  // Si el backend confirma que fue bien, cerramos el modal y volvemos
  // a pintar la lista de películas (ya sin la que se acaba de borrar).
  if (respuestaEliminar.ok) {
    modal.classList.add('oculto');
    cargarPeliculas();
  }

  // En cualquier caso, se limpia el id pendiente.
  idPeliculaAEliminar = null;
});

// ---- CARGA Y PINTADO DE LAS PELÍCULAS ----

async function cargarPeliculas() {
  // Pide al backend la lista actual de películas (en formato JSON).
  const respuesta = await fetch('/api/peliculas');
  const peliculas = await respuesta.json();
  console.log(peliculas);

  // Vaciamos el contenedor antes de repintar, para no duplicar tarjetas
  // cada vez que se llama a esta función (por ejemplo, tras eliminar una).
  const listaPeliculas = document.querySelector('#lista-peliculas');
  listaPeliculas.innerHTML = '';

  // Por cada película, se crea su tarjeta (<article>) y se añade al DOM.
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

    // Como esta tarjeta se crea de cero en cada repintado, es seguro
    // registrar aquí sus listeners: no se acumulan, porque la tarjeta
    // vieja (con sus listeners) se destruyó al hacer innerHTML = ''.

    // Clic en el póster: abre el lightbox mostrando la imagen ampliada.
    const imagenPelicula = tarjeta.querySelector('.poster-pelicula');
    imagenPelicula.addEventListener('click', () => {
      lightboxImg.src = imagenPelicula.src;
      lightbox.classList.add('open');
    });

    // Clic en el icono de papelera: guarda el id de esta película como
    // "pendiente de eliminar" y muestra el modal de confirmación.
    const botonEliminar = tarjeta.querySelector('.btn-eliminar');
    botonEliminar.addEventListener('click', () => {
      idPeliculaAEliminar = Number(botonEliminar.dataset.id);
      modal.classList.remove('oculto');
    });

    // Clic en el icono de lápiz: rellena el formulario de arriba con los
    // datos de esta película y cambia su "action" para que, al enviarlo,
    // vaya a /editar-pelicula en vez de /anadir-pelicula.
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

// Primera carga de la página: pinta la lista de películas al arrancar.
cargarPeliculas();