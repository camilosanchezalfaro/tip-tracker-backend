const axios = require('axios'); // Si usas axios para hacer solicitudes HTTP
const cheerio = require('cheerio'); // Si usas cheerio para hacer scraping

async function scanWebsite(config) {
  try {
    // Obtén el contenido de la web
    const response = await axios.get(config.url);
    const $ = cheerio.load(response.data);

    // Extrae los pronósticos usando el selector proporcionado
    const pronosticos = [];
    $(config.selectorPronosticos).each((index, element) => {
      const pronostico = $(element).text().trim();
      pronosticos.push(pronostico);
    });

    // También puedes hacer lo mismo con las fechas y títulos si es necesario
    const fechas = [];
    $(config.selectorFecha).each((index, element) => {
      fechas.push($(element).text().trim());
    });

    const titulos = [];
    $(config.selectorTitulos).each((index, element) => {
      titulos.push($(element).text().trim());
    });

    return { pronosticos, fechas, titulos };

  } catch (error) {
    console.error('Error al escanear la web:', error);
    throw new Error('Error al escanear la web');
  }
}

module.exports = { scanWebsite };
