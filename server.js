const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'https://tip-tracker-frontend.vercel.app',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Cargar el diccionario
let dictionaries = {};
fs.readFile('./dictionaries.json', 'utf-8', (err, data) => {
    if (err) {
        console.error('Error al leer el diccionario:', err);
    } else {
        dictionaries = JSON.parse(data);
    }
});

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

        // Usar el diccionario para buscar palabras clave
        const { titles, date_formats, tip_keywords } = dictionaries;

        // Ajuste del selector para extraer los pronósticos
        $('p').each((_, element) => {
            const text = $(element).text().trim();

            const titleMatch = titles.some(title => text.includes(title));
            const dateMatch = date_formats.some(format => text.match(new RegExp(format)));
            const tipMatch = tip_keywords.some(keyword => text.includes(keyword));

            // Si hay coincidencia, lo agregamos al array de resultados
            if (titleMatch && dateMatch && tipMatch) {
                foundTips.push(text);
            }
        });

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

// Ruta para agregar al diccionario
app.post('/api/add-dictionary', async (req, res) => {
    const { title, dateFormat, tipFormat } = req.body;

    if (!title || !dateFormat || !tipFormat) {
        return res.status(400).json({ success: false, message: 'Datos incompletos para agregar al diccionario.' });
    }

    try {
        // Agregar al diccionario
        dictionaries.titles.push(...title);
        dictionaries.date_formats.push(...dateFormat);
        dictionaries.tip_keywords.push(...tipFormat);

        // Guardar el diccionario actualizado
        fs.writeFileSync('./dictionaries.json', JSON.stringify(dictionaries, null, 2));

        return res.json({ success: true, message: 'Datos agregados correctamente al diccionario.' });
    } catch (error) {
        console.error('Error al agregar al diccionario:', error);
        res.status(500).json({ success: false, message: 'Error al agregar al diccionario.' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
