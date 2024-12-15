const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir solicitudes CORS
app.use(cors());

// Middleware para procesar JSON
app.use(express.json());

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

        // Buscar términos clave
        const keywords = ["FREE FOOTBALL PREDICTIONS TODAY", "FREE TIPS", "DAILY PREDICTIONS"];
        let foundTips = [];

        $('*').each((_, element) => {
            const text = $(element).text().trim();
            keywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    foundTips.push(text);
                }
            });
        });

        if (foundTips.length > 0) {
            return res.json({ success: true, tips: foundTips });
        } else {
            return res.json({ success: false, message: 'No se encontraron tips en esta URL.' });
        }

    } catch (error) {
        console.error('Error al analizar la URL:', error);
        res.status(500).json({ success: false, message: 'Error al procesar la URL.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
