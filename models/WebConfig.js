const mongoose = require('mongoose');

const WebConfigSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  selectorPronosticos: {
    type: String,
    required: true,
  },
  selectorFecha: {
    type: String,
    required: true,
  },
  selectorTitulos: {
    type: String,
    required: true,
  },
  palabrasClave: {
    type: [String],
    required: true,
  },
});

module.exports = mongoose.model('WebConfig', WebConfigSchema);

