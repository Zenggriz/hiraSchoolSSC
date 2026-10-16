const mongoose = require('mongoose');
let connectionPromise = null;

// Mongoose ki aik shared connection server aur dono models use karte hain.
function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

async function connectDatabase() {
  if (isDatabaseConnected()) return true;
  if (connectionPromise) return connectionPromise;

  const connectionString = process.env.MONGODB_URI;
  if (!connectionString) {
    // App static files/API start reh sakti hai, lekin DB endpoints baad mein 503 denge.
    console.warn('MONGODB_URI is not set; database-backed endpoints will return 503.');
    return false;
  }

  // Serverless cold start par connection fail ho to aglay request ko dobara connect ki koshish ka mauqa milta hai.
  connectionPromise = mongoose.connect(connectionString, { serverSelectionTimeoutMS: 8000 })
    .then(() => {
      console.log('MongoDB connected successfully.');
      return true;
    })
    .catch((error) => {
      // Failure ko log karte hain, taa-ke DB outage chup kar success na lage.
      console.error('MongoDB connection failed:', error.message);
      return false;
    })
    .finally(() => {
      connectionPromise = null;
    });

  return connectionPromise;
}

module.exports = { connectDatabase, isDatabaseConnected };
