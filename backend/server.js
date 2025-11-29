require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error');

// Connect to database
connectDB();

const app = express();

// CORS Configuration - Allow multiple origins including Vercel preview deployments
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://road-repair-and-tracking-system-vv8.vercel.app',
  'https://road-repair-and-tracking-system-vv8s.vercel.app',
  'https://road-repair-and-tracking-system-qyo.vercel.app',
  /https:\/\/road-repair-and-tracking-system-.*\.vercel\.app$/, // All Vercel deployments
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches regex pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
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
