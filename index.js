import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;

// __filename y __dirname no existen por defecto en módulos ES (type: "module"),
// así que hay que reconstruirlos manualmente a partir de la URL del propio archivo.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta absoluta al archivo JSON donde se guardan las películas.
const archivoPeliculas = path.join(__dirname, 'peliculas.json');

// Sirve archivos estáticos (HTML, CSS, JS del frontend) desde la carpeta 'public'.
// Gracias a esto, al entrar en "/" el navegador recibe automáticamente public/index.html.
app.use(express.static(path.join(__dirname, 'public')));

// Sirve las imágenes de la carpeta 'img' bajo la ruta /img/...
app.use('/img', express.static(path.join(__dirname, 'img')));

// Permite leer datos enviados por formularios HTML tradicionales (Content-Type: x-www-form-urlencoded).
app.use(express.urlencoded({ extended: true }));

// Permite leer datos enviados como JSON en el body (los que manda tu fetch del modal, por ejemplo).
app.use(express.json());

// Carga inicial de las películas desde el archivo JSON al arrancar el servidor.
// Se guardan en memoria (en esta variable) mientras el servidor está corriendo.
let peliculas = JSON.parse(await readFile(archivoPeliculas, 'utf-8'));

// Guarda el array "peliculas" actual de vuelta en el archivo JSON,
// para que los cambios (añadir/editar/eliminar) persistan entre reinicios del servidor.
async function guardarPeliculas() {
  await writeFile(archivoPeliculas, JSON.stringify(peliculas, null, 2));
}

// ---- RUTA: obtener todas las películas ----
// La usa el frontend (cargarPeliculas() en app.js) para pintar la lista.
app.get('/api/peliculas', (req, res) => {
  res.json(peliculas);
});

// ---- RUTA: añadir una película nueva ----
// Recibe título, director y año desde el formulario del index.html.
app.post('/anadir-pelicula', async (req, res) => {
  const { titulo, director, anio } = req.body;

  const url = `https://www.omdbapi.com/?apikey=7f438388&t=${encodeURIComponent(titulo)}`;
  console.log(url);

  // Consulta a la API externa OMDb para intentar conseguir el póster de la película
  // a partir del título (y el año, para afinar la búsqueda si hay varias coincidencias).
  const respuestaOMDb = await fetch(`https://www.omdbapi.com/?apikey=7f438388&t=${encodeURIComponent(titulo)}&y=${anio}`);
  const datosOMDb = await respuestaOMDb.json();
  console.log(datosOMDb);

  // OMDb devuelve el texto "N/A" cuando no tiene póster, así que se comprueba
  // explícitamente para no guardar ese texto como si fuera una URL válida.
  const imagen = (datosOMDb.Poster && datosOMDb.Poster !== "N/A") ? datosOMDb.Poster : null;

  // Se construye la nueva película. El id se calcula como el mayor id existente + 1
  // (o 1 si todavía no hay ninguna película), para no repetir ids.
  const nuevaPelicula = {
    id: peliculas.length > 0 ? Math.max(...peliculas.map(pelicula => pelicula.id)) + 1 : 1,
    titulo,
    director,
    anio: Number(anio), // se fuerza a número porque req.body siempre llega como string
    imagen
  };

  peliculas.push(nuevaPelicula);

  // Nota: aquí no se llama a guardarPeliculas(), así que esta película
  // solo queda en memoria hasta que se elimine algo (que sí guarda) o se reinicie el servidor.
  res.redirect('/');
});

// ---- RUTA: editar una película existente ----
app.post("/editar-pelicula", async (req, res) => {
  const idPeliculaEditar = Number(req.body.id);
  const pelicula = peliculas.find(p => p.id === idPeliculaEditar);

  // Si no existe una película con ese id, se corta aquí con un 404.
  if (!pelicula) {
    return res.status(404).send('Película no encontrada');
  }

  // Se sobrescriben los campos con los nuevos valores del formulario.
  pelicula.titulo = req.body.titulo;
  pelicula.director = req.body.director;
  pelicula.anio = Number(req.body.anio);

  res.redirect('/');
});

// ---- RUTA: eliminar una película ----
// La usa el botón "Eliminar" del modal de confirmación (fetch DELETE desde app.js).
app.delete('/eliminar-pelicula', async (req, res) => {
  const idEliminar = req.body.id;

  const indicePelicula = peliculas.findIndex(pelicula => pelicula.id === idEliminar);

  if (indicePelicula !== -1) {
    peliculas.splice(indicePelicula, 1);
  }

  // Esta ruta sí persiste el cambio en el archivo JSON.
  await guardarPeliculas();

  // Se devuelve la lista actualizada, aunque en app.js ahora mismo
  // no se usa esta respuesta: tras el DELETE se vuelve a llamar a cargarPeliculas().
  res.json(peliculas);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});