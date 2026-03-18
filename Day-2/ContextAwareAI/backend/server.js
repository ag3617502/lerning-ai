const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Initialize the database connection.
 * Our modularized logic is now in config/db.js.
 */
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// Middleware Setup
// Enabling CORS so our frontend (likely on another port) can communicate with us
app.use(cors({
  exposedHeaders: ['X-Conversation-Id']
}));

// Parsing JSON bodies for incoming requests
app.use(express.json());

/**
 * Route Definitions
 * We have split our routes into Auth and Chat for better organization.
 */

// Auth routes (Signup, Login)
app.use('/api/auth', require('./routes/authRoutes'));

// Chat routes (Messages, Conversations) - These will be protected inside the router
app.use('/api/chat', require('./routes/chatRoutes'));

// Basic health check route
app.get('/', (req, res) => {
  res.send('AI Chatbot Backend is running...');
});

// Error Handling Middleware (Human-like touch for clearer errors)
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📡 URL: http://localhost:${port}`);
});

