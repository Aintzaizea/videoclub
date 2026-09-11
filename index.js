import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;


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
  req.body.id = Date.now();
  req.body.anio = Number(req.body.anio)
  peliculas.push(req.body);
  await guardarPeliculas();
  console.log(req.body);
  res.redirect('/');
});

app.post ("/editar-pelicula", async (req, res)=> {
const idPeliculaEditar = Number(req.body.id);
const pelicula = peliculas.find(p => p.id === idPeliculaEditar);
req.body.anio = Number(req.body.anio)
pelicula.titulo = req.body.titulo
pelicula.director = req.body.director
pelicula.anio = req.body.anio
await guardarPeliculas();
res.redirect('/');
});

app.delete('/eliminar-pelicula', async (req, res) => {
  const idEliminar = Number(req.query.id);
  peliculas = peliculas.filter(p => p.id !== idEliminar);
  await guardarPeliculas();
  res.json(peliculas);
});
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


