const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las solicitudes
app.use(cors());
app.use(express.json());

// Cargar los diccionarios desde el archivo JSON
const dictionaries = JSON.parse(fs.readFileSync(path.join(__dirname, 'dictionaries.json')));

// Ruta para escanear la web
app.post('/api/scan', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: 'URL no proporcionada.' });
  }

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    let foundTips = [];

    // Paso 1: Verificar si el título está en el diccionario
    const bodyText = $('body').text();
    const containsValidTitle = dictionaries.titles.some(keyword => bodyText.includes(keyword));

    if (!containsValidTitle) {
      return res.json({ success: false, message: 'No se encontró un título válido.' });
    }

    // Paso 2: Verificar si hay una fecha válida
    const dateMatch = dictionaries.date_formats.some(format => bodyText.match(new RegExp(format)));

    if (!dateMatch) {
      return res.json({ success: false, message: 'No se encontró una fecha válida.' });
    }

    // Paso 3: Buscar pronósticos
    $('p').each((_, element) => {
      const text = $(element).text().trim();

      // Verificar si el texto contiene alguna de las palabras clave para pronósticos
      if (dictionaries.tip_keywords.some(keyword => text.includes(keyword))) {
        foundTips.push(text);
      }
    });

    if (foundTips.length > 0) {
      return res.json({ success: true, tips: foundTips });
    } else {
      return res.json({ success: false, message: 'No se encontraron tips.' });
    }

  } catch (error) {
    console.error('Error al analizar la URL:', error);
    res.status(500).json({ success: false, message: 'Error al procesar la URL.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
