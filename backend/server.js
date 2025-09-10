require('dotenv').config();
const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api/ai', aiRoutes);

// Basic root route
app.get('/', (req, res) => {
  res.send('Ashval Writer\'s Suite Backend is running!');
});

// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  if (!process.env.API_KEY) {
    console.warn('WARNING: API_KEY is not set in the backend .env file. AI features will not work.');
  } else {
    console.log('API_KEY is loaded on the backend.');
  }
});
