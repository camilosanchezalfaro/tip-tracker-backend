const express = require('express');
const WebConfig = require('../models/WebConfig');  // Ruta al modelo WebConfig
const { scanWebsite } = require('../../server');  // Asegúrate de exportar la función scanWebsite desde server.js

const router = express.Router();

router.post('/scan', async (req, res) => {
  const { webId } = req.body;
  try {
    const config = await WebConfig.findById(webId);
    if (!config) {
      return res.status(404).json({ error: 'Web configuration not found' });
    }
    const pronosticos = await scanWebsite(config);
    res.json(pronosticos);
  } catch (error) {
    res.status(500).json({ error: 'Error al escanear la web' });
  }
});

module.exports = router;
