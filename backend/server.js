require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/work-assignments', require('./routes/workAssignments'));

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Road Repair and Tracking System API',
    version: '1.0.0'
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
