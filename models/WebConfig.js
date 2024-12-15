const mongoose = require('mongoose');

const webConfigSchema = new mongoose.Schema({
  url: { type: String, required: true },
  selectorPronosticos: { type: String, required: true },
  selectorFecha: { type: String, required: true },
  selectorTitulos: { type: String, required: true },
  palabrasClave: { type: [String], required: true },
});

const WebConfig = mongoose.model('WebConfig', webConfigSchema);

module.exports = WebConfig;
