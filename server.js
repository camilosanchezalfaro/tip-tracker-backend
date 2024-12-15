const express = require('express');
const cors = require('cors');  // Importa CORS
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const WebConfig = require('./models/WebConfig'); // Suponiendo que tienes un modelo WebConfig

const app = express();

// Habilita CORS globalmente para todas las rutas
app.use(cors());

app.use(express.json());

// Utilizar variables de entorno para la URL de la base de datos
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pronosticos', { useNewUrlParser: true, useUnifiedTopology: true });

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
app.post('/api/scan', async (req, res) => {
  const { webId } = req.body;
  try {
    const config = await WebCon
