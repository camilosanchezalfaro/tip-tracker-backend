const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

// Configuración de la app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexión a MongoDB
mongoose.connect('mongodb+srv://<TU_USUARIO>:<TU_PASSWORD>@cluster.mongodb.net/tipTracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Modelo de Configuración
const webConfigSchema = new mongoose.Schema({
    url: String,
    title_keywords: [String],
    date_patterns: [String],
    tip_patterns: [String],
    html_structure: {
        tips_container: String,
        date_location: String,
        title_location: String
    }
});

const WebConfig = mongoose.model('WebConfig', webConfigSchema);

// Ruta para agregar configuración de una web
app.post('/api/add-web-config', async (req, res) => {
    const { url, title_keywords, date_patterns, tip_patterns, html_structure } = req.body;

    if (!url || !title_keywords || !date_patterns || !tip_patterns || !html_structure) {
        return res.status(400).json({ success: false, message: 'Faltan datos para la configuración.' });
    }

    try {
        const config = await WebConfig.create({ url, title_keywords, date_patterns, tip_patterns, html_structure });
        res.json({ success: true, message: 'Configuración guardada correctamente.', data: config });
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        res.status(500).json({ success: false, message: 'Error al guardar la configuración.' });
    }
});

// Ruta para escanear una web usando la configuración
app.post('/api/scan', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ success: false, message: 'URL no proporcionada.' });
    }

    try {
        const config = await WebConfig.findOne({ url });

        if (!config) {
            return res.status(404).json({ success: false, message: 'Configuración no encontrada para esta URL.' });
        }

        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        let foundTips = [];
        let titleFound = false;

        config.title_keywords.forEach(keyword => {
            if (html.includes(keyword)) {
                titleFound = true;
            }
        });

        if (titleFound) {
            const dateText = $(config.html_structure.date_location).text();
            const validDate = config.date_patterns.some(pattern => new RegExp(pattern).test(dateText));

            if (validDate) {
                $(config.html_structure.tips_container).each((_, element) => {
                    const text = $(element).text();
                    if (config.tip_patterns.some(keyword => text.includes(keyword))) {
                        foundTips.push(text);
                    }
                });
            }
        }

        res.json({
            success: true,
            tips: foundTips.length ? foundTips : 'No se encontraron tips.'
        });
    } catch (error) {
        console.error('Error al analizar la URL:', error);
        res.status(500).json({ success: false, message: 'Error al procesar la URL.' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor ejecutándose en el puerto ${PORT}`));
