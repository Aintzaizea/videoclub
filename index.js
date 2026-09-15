import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001
;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const archivoPeliculas = path.join(__dirname, 'peliculas.json');

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'img')));

// Cuando entremos a /, buscará automáticamente index.html en public/

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let peliculas = JSON.parse(await readFile(archivoPeliculas, 'utf-8'));

async function guardarPeliculas() {
  await writeFile(archivoPeliculas, JSON.stringify(peliculas, null, 2));
}


app.get('/api/peliculas', (req, res) => {
    res.json(peliculas);
});

app.post('/anadir-pelicula', async (req, res) => {
  const { titulo, director, anio } = req.body;
  const url = `https://www.omdbapi.com/?apikey=7f438388&t=${encodeURIComponent(titulo)}`;
 console.log(url);
  const respuestaOMDb = await fetch(`https://www.omdbapi.com/?apikey=7f438388&t=${encodeURIComponent(titulo)}&y=${anio}`);
  const datosOMDb = await respuestaOMDb.json();
  console.log(datosOMDb);
  const imagen = (datosOMDb.Poster && datosOMDb.Poster !== "N/A") ? datosOMDb.Poster : null;

  const nuevaPelicula = {
    id: peliculas.length > 0 ? Math.max(...peliculas.map(pelicula => pelicula.id)) + 1 : 1,
    titulo,
    director,
    anio: Number(anio),
    imagen
  };

  peliculas.push(nuevaPelicula);
  res.redirect('/');
});

app.post("/editar-pelicula", async (req, res) => {
  const idPeliculaEditar = Number(req.body.id);
  const pelicula = peliculas.find(p => p.id === idPeliculaEditar);

  if (!pelicula) {
    return res.status(404).send('Película no encontrada');
  }

  pelicula.titulo = req.body.titulo;
  pelicula.director = req.body.director;
  pelicula.anio = Number(req.body.anio);
  res.redirect('/');
});;

app.delete('/eliminar-pelicula', async (req, res) => {
  const idEliminar = (req.body.id);
    const indicePelicula = peliculas.findIndex(pelicula => pelicula.id === idEliminar);
    if (indicePelicula !== -1) {
      peliculas.splice(indicePelicula, 1);
    }
  await guardarPeliculas();
  res.json(peliculas);
});
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


