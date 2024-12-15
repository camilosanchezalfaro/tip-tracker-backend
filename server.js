const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(express.json());  // Para manejar JSON en el cuerpo de las solicitudes

// Conexión con MongoDB Atlas
mongoose.connect('mongodb+srv://<usuario>:<contraseña>@cluster0.mongodb.net/tiptracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Conectado a la base de datos de MongoDB'))
  .catch((error) => console.error('Error de conexión a MongoDB:', error));

// Definir esquema de configuración para las webs
const webConfigSchema = new mongoose.Schema({
  url: String,
  titles: [String],
  dateFormats: [String],
  tipKeywords: [String],
  cssSelectors: {
    tip: String,
    date: String,
    title: String
  }
});

const WebConfig = mongoose.model('WebConfig', webConfigSchema);

// Ruta para agregar configuración de página web
app.post('/api/configure-web', async (req, res) => {
  const { url, titles, dateFormats, tipKeywords, cssSelectors } = req.body;

  try {
    const newConfig = new WebConfig({
      url,
      titles,
      dateFormats,
      tipKeywords,
      cssSelectors
    });

    await newConfig.save();
    res.json({ success: true, message: 'Configuración guardada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al guardar la configuración' });
  }
});

// Resto de las rutas y lógica para escanear las webs, como el ejemplo anterior

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
