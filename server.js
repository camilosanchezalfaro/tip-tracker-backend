const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las solicitudes desde tu frontend en Vercel
app.use(cors({
    origin: 'https://tip-tracker-frontend.vercel.app',  // Permite solicitudes solo desde el frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Ruta para escanear la web
app.post('/api/scan', async (req, res) => {
    const { url, keywords } = req.body;

    if (!url || !keywords || keywords.length === 0) {
        return res.status(400).json({ success: false, message: 'URL o palabras clave no proporcionadas.' });
    }

    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        let foundTips = [];

        // Ajuste del selector para extraer solo los pronósticos específicos
        $('p').each((_, element) => {
            const text = $(element).text().trim();

            // Verificar si el texto coincide con el formato de pronóstico
            if (text.match(/MATCH:.*PICK:.*ODD:/)) {
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
        // Aquí puedes guardar los datos en una base de datos o archivo (por ahora solo mostraría la información)
        // Dependiendo de cómo lo quieras almacenar
        console.log('Datos para agregar al diccionario:', { title, dateFormat, tipFormat });
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
