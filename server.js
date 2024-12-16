const express = require('express');
const cors = require('cors');
const connectDB = require('./db'); // Importamos la conexión a la base de datos
const WebConfig = require('./models/WebConfig');
const scanRoutes = require('./api/scan');

const app = express();

app.use(cors());
app.use(express.json());

// Conectar a MongoDB
connectDB();

// Usamos las rutas definidas en scan.js
app.use('/api', scanRoutes);

app.post('/api/add-web-config', async (req, res) => {
  const { url, selectorPronosticos, selectorFecha, selectorTitulos, palabrasClave } = req.body;
  try {
    const newConfig = new WebConfig({ url, selectorPronosticos, selectorFecha, selectorTitulos, palabrasClave });
    await newConfig.save();
    res.json({ success: true, message: 'Configuración guardada exitosamente' });
  } catch (error) {
    console.error('Error al guardar la configuración:', error);
    res.status(500).json({ error: 'Error al guardar la configuración' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
