// tip-tracker-backend/api/add-web-config.js

const express = require('express');
const WebConfig = require('../models/WebConfig');  // Asegúrate de importar correctamente el modelo

const router = express.Router();

// Ruta para agregar configuración de la web
router.post('/', async (req, res) => {
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

module.exports = router;
