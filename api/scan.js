const express = require('express');
const WebConfig = require('../models/WebConfig');  // Ruta al modelo WebConfig
const { scanWebsite } = require('../server');  // Ruta correcta si server.js está en la raíz

const router = express.Router();

router.post('/scan', async (req, res) => {
  const { webId } = req.body;
  if (!webId) {
    return res.status(400).json({ error: 'El ID de la web es requerido' });
  }
  try {
    const config = await WebConfig.findById(webId);
    if (!config) {
      return res.status(404).json({ error: 'Configuración de web no encontrada' });
    }
    const pronosticos = await scanWebsite(config);
    res.json(pronosticos);
  } catch (error) {
    res.status(500).json({ error: 'Error al escanear la web' });
  }
});


module.exports = router;
