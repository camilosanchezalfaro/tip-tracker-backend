const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(express.json());  // Para manejar JSON en el cuerpo de las solicitudes

// Ruta para agregar palabras clave al diccionario
app.post('/api/add-dictionary', (req, res) => {
    const { titles, date_formats, tip_keywords } = req.body;

    if (!titles || !date_formats || !tip_keywords) {
        return res.status(400).json({ success: false, message: 'Faltan datos en el diccionario.' });
    }

    // Aquí se agregarían los datos al diccionario, que se guarda en memoria o base de datos.
    // Esto es solo un ejemplo, debes asegurarte de guardarlos en tu almacenamiento real.
    // Aquí guardamos los valores temporalmente en una variable global como ejemplo.
    global.dictionary = {
        titles,
        date_formats,
        tip_keywords
    };

    return res.json({ success: true, message: 'Diccionario actualizado correctamente.' });
});

// Ruta para escanear la URL
app.post('/api/scan', async (req, res) => {
    const { url, keywords } = req.body;

    if (!url || !keywords) {
        return res.status(400).json({ success: false, message: 'URL o palabras clave no proporcionadas.' });
    }

    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        let foundTips = [];

        // Buscar Título
        let foundTitle = false;
        for (let title of keywords.titles) {
            if (html.includes(title)) {
                foundTitle = true;
                break;
            }
        }

        // Si se encuentra el título, buscar la fecha
        if (foundTitle) {
            let foundDate = false;
            const dateFormats = keywords.date_formats;

            // Verificar si la fecha en la página coincide con los formatos ingresados
            $('body').text().split(' ').forEach(word => {
                for (let dateFormat of dateFormats) {
                    if (matchDateFormat(word, dateFormat)) {
                        foundDate = true;
                        break;
                    }
                }
            });

            // Si se encuentra la fecha, buscar los tips de pronóstico
            if (foundDate) {
                $('p').each((_, element) => {
                    const text = $(element).text().trim();
                    for (let tipKeyword of keywords.tip_keywords) {
                        if (text.toUpperCase().includes(tipKeyword)) {
                            foundTips.push(text);
                            break;
                        }
                    }
                });
            }
        }

        if (foundTips.length > 0) {
            return res.json({ success: true, tips: foundTips });
        } else {
            return res.json({ success: false, message: 'No se encontraron tips con esas palabras clave.' });
        }
    } catch (error) {
        console.error('Error al analizar la URL:', error);
        res.status(500).json({ success: false, message: 'Error al procesar la URL.' });
    }
});

// Función para comparar fechas con los formatos ingresados
function matchDateFormat(dateString, format) {
    const dateParts = dateString.split(/[^0-9a-zA-Z]+/); // Dividir por cualquier no alfanumérico
    const formatParts = format.split(' '); // Esperamos que el formato esté separado por espacios

    // Compara las partes de la fecha con el formato
    if (dateParts.length !== formatParts.length) return false;

    for (let i = 0; i < dateParts.length; i++) {
        if (formatParts[i] === 'dd' && !/^\d{2}$/.test(dateParts[i])) return false;
        if (formatParts[i] === 'mm' && !/^\d{2}$/.test(dateParts[i])) return false;
        if (formatParts[i] === 'aaaa' && !/^\d{4}$/.test(dateParts[i])) return false;
    }

    return true;
}

// Inicializa el diccionario globalmente (esto es solo para demostración, deberías usar una base de datos o almacenamiento adecuado)
global.dictionary = {
    titles: ['FREE FOOTBALL PREDICTIONS', 'DAILY PREDICTIONS', 'DAILY FOOTBALL TIPS'],  // Ejemplo de títulos
    date_formats: ['dd mm aaaa', 'dd.mm.aaaa'],  // Ejemplo de formatos de fecha
    tip_keywords: ['PICK', 'ODD', 'TIP', 'MATCH']  // Ejemplo de palabras clave para pronósticos
};

// Configuración del puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
