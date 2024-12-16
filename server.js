const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');  // Importa axios
const cheerio = require('cheerio');  // Importa cheerio
const WebConfig = require('./models/WebConfig'); // Suponiendo que tienes un modelo WebConfig
const scanRoutes = require('./api/scan');  // Importamos las rutas del archivo scan.js

const app = express();

// Habilita CORS globalmente para todas las rutas
app.use(cors());
app.use(express.json());

// Asegúrate de que MONGODB_URI esté configurada en las variables de entorno
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('Falta la variable de entorno MONGODB_URI');
  process.exit(1);
}

// Conectar a MongoDB usando mongoose
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch((err) => console.error('Error al conectar a MongoDB:', err));

// Función para escanear una web y obtener pronósticos
async function scanWebsite(config) {
  try {
    const response = await axios.get(config.url);
    const $ = cheerio.load(response.data);

    // Buscamos los pronósticos con los selectores CSS configurados
    const pronosticos = [];
    $(config.selectorPronosticos).each((i, el) => {
      const pronostico = $(el).text();
      const fecha = $(config.selectorFecha).text();
      const titulo = $(config.selectorTitulos).text();

      // Filtrar los pronósticos según las palabras clave
      if (config.palabrasClave.some(palabra => pronostico.includes(palabra))) {
        pronosticos.push({
          pronostico,
          fecha,
          titulo,
        });
      }
    });

    return pronosticos;

  } catch (error) {
    console.error("Error al escanear la web:", error);
    return [];
  }
}

// Usamos las rutas definidas en scan.js
app.use('/api', scanRoutes);

// Ruta de prueba para agregar configuraciones
app.post('/api/add-web-config', async (req, res) => {
  const { url, selectorPronosticos, selectorFecha, selectorTitulos, palabrasClave } = req.body;
  try {
    const newConfig = new WebConfig({ url, selectorPronosticos, selectorFecha, selectorTitulos, palabrasClave });
    await newConfig.save();
    res.json({ success: true, message: 'Configuración guardada exitosamente' });
  } catch (error) {
    console.error('Error al guardar la configuración:', error);
    res.status(500).json({ error: 'Error al guardar la configuración' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

module.exports = { scanWebsite };  // Exporta la función para ser utilizada en scan.js
