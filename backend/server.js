const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectMongoDB = require('./config/db');
const { connectMySQL } = require('./config/mysql');

dotenv.config();

// Connect to MongoDB
connectMongoDB();

// Connect to MySQL
connectMySQL();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));
app.use('/api/share', require('./routes/shareRoutes'));

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to News Aggregator API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Process error handlers to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  console.log('Node NOT exiting...');
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  console.log('Node NOT exiting...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
