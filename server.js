const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las solicitudes
app.use(cors());
app.use(express.json());

// Conexión a la base de datos (usando MongoDB)
mongoose.connect('mongodb://localhost:27017/tipTracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Conectado a MongoDB');
}).catch((error) => {
    console.error('Error al conectar a MongoDB:', error);
});

// Definir el esquema y el modelo para los diccionarios
const dictionarySchema = new mongoose.Schema({
    title: [String],
    dateFormat: [String],
    tipFormat: [String]
});

const Dictionary = mongoose.model('Dictionary', dictionarySchema);

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

        // Buscar los pronósticos utilizando las palabras clave
        $('p').each((_, element) => {
            const text = $(element).text().trim();

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

// Ruta para agregar un diccionario
app.post('/api/add-dictionary', async (req, res) => {
    const { title, dateFormat, tipFormat } = req.body;

    if (!title || !dateFormat || !tipFormat) {
        return res.status(400).json({ success: false, message: 'Faltan datos para agregar al diccionario.' });
    }

    try {
        let dictionary = await Dictionary.findOne();

        if (!dictionary) {
            dictionary = new Dictionary({
                title: [],
                dateFormat: [],
                tipFormat: []
            });
        }

        // Agregar nuevas palabras clave a cada diccionario
        dictionary.title.push(...title);
        dictionary.dateFormat.push(...dateFormat);
        dictionary.tipFormat.push(...tipFormat);

        await dictionary.save();

        return res.json({ success: true, message: 'Diccionario actualizado correctamente.' });
    } catch (error) {
        console.error('Error al agregar al diccionario:', error);
        res.status(500).json({ success: false, message: 'Error al agregar al diccionario.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
