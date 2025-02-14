const express = require('express');
const connectDB = require('./config');

const app = express();
const PORT = process.env.PORT || 5500;

// Connect to MongoDB
connectDB();

// Basic route to test server
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});