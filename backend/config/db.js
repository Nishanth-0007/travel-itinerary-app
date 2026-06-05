const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/travel-itinerary';
  let retries = 5;

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      retries -= 1;
      console.error(`❌ MongoDB connection failed. Retries left: ${retries}`);
      if (retries === 0) {
        console.error('MongoDB connection exhausted. Exiting process.');
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

module.exports = connectDB;
