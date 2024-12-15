// Asegúrate de tener esto en tu backend (tip-tracker-backend/server.js)
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las solicitudes
app.use(cors({
    origin: 'https://tip-tracker-frontend.vercel.app', // Permitir solo solicitudes de tu frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

// Ruta para agregar a los diccionarios
app.post('/api/add-dictionary', async (req, res) => {
    // Lógica para agregar a los diccionarios
    try {
        // Aquí agregas el código para almacenar los datos en los diccionarios
        // (puedes guardarlos en un archivo, base de datos, etc.)
        console.log(req.body); // Para verificar que se reciben correctamente los datos
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error al agregar al diccionario:', error);
        res.status(500).json({ success: false, message: 'Error al agregar al diccionario.' });
    }
});

// Ruta para escanear la web
app.post('/api/scan', async (req, res) => {
    // Lógica del escaneo aquí...
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
