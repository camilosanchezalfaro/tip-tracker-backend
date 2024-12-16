const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    throw new Error('Falta la variable de entorno MONGODB_URI');
  }

  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conexión a MongoDB exitosa');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1); // Salimos del proceso si la conexión falla
  }
};

module.exports = connectDB;
