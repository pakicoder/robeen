require('dotenv').config();
const express = require('express');
const citiesRouter = require('./controllers/citiesController');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/cities', citiesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API User: ${process.env.POLLUTION_API_USER || 'using default'}`);
});