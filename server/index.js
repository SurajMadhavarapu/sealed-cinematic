require('dotenv').config();
const express = require('express');
const cors = require('cors');
const validateEnv = require('./config/validateEnv');

// Import scheduler
const { startScheduler } = require('./services/schedulerService');

// Import routes
const authRoutes = require('./routes/authRoutes');
const vaultRoutes = require('./routes/vaultRoutes');
const letterRoutes = require('./routes/letterRoutes');
const voteRoutes = require('./routes/voteRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const {
  securityHeaders,
  enforceHttps,
  requestLogger,
  apiLimiter,
} = require('./middleware/security');

const app = express();
app.set('trust proxy', 1);
validateEnv();

// Security middleware
app.use(securityHeaders);
app.use(enforceHttps);
app.use(requestLogger);

// Body parser
app.use(express.json());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Global API abuse protection
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vaults', vaultRoutes);
app.use('/api/vaults/:vaultId/letters', letterRoutes);
app.use('/api/vaults/:vaultId/letters/:letterId/votes', voteRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║      🔐 SEALED API Server                 ║
║      Running on port ${PORT}                  ║
║      ${process.env.NODE_ENV || 'development'} mode                    ║
╚═══════════════════════════════════════════╝
  `);

  // Start the letter unlock scheduler
  startScheduler();
});
