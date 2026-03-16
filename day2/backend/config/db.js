const mongoose = require('mongoose');

/**
 * Connects to MongoDB database using Mongoose.
 * This is a centralized configuration for our database connection.
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_chatbot';
    
    // Attempting to connect to the database...
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully!');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
