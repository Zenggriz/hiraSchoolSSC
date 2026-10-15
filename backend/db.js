const mongoose = require('mongoose');

// Mongoose ki aik shared connection server aur dono models use karte hain.
function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

async function connectDatabase() {
  const connectionString = process.env.MONGODB_URI;
  if (!connectionString) {
    // App static files/API start reh sakti hai, lekin DB endpoints baad mein 503 denge.
    console.warn('MONGODB_URI is not set; database-backed endpoints will return 503.');
    return false;
  }

  try {
    await mongoose.connect(connectionString);
    console.log('MongoDB connected successfully.');
    return true;
  } catch (error) {
    // Failure ko log karte hain, taa-ke DB outage chup kar success na lage.
    console.error('MongoDB connection failed:', error.message);
    return false;
  }
}

module.exports = { connectDatabase, isDatabaseConnected };
