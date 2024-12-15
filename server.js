const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const WebConfig = require('./models/WebConfig'); // Suponiendo que tienes un modelo WebConfig

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/pronosticos', { useNewUrlParser: true, useUnifiedTopology: true });

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

// Endpoint para escanear una web
app.post('/scan-website', async (req, res) => {
  const { webId } = req.body;
  try {
    const config = await WebConfig.findById(webId);
    if (!config) {
      return res.status(404).json({ error: 'Web configuration not found' });
    }
    const pronosticos = await scanWebsite(config);
    res.json(pronosticos);
  } catch (error) {
    res.status(500).json({ error: 'Error al escanear la web' });
  }
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
