const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const redis = require('redis');
const winston = require('winston');
const compression = require('compression');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'hydra-gateway-secret';

// Redis client for caching and rate limiting
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/gateway.log' })
  ]
});

// Middleware setup
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit auth attempts
  message: { error: 'Too many authentication attempts' }
});

app.use(globalLimiter);

// Service registry
const services = {
  orchestrator: { url: 'http://localhost:3000', healthPath: '/health' },
  landing: { url: 'http://localhost:31000', healthPath: '/health' },
  worker: { url: 'http://localhost:32000', healthPath: '/health' },
  click: { url: 'http://localhost:30000', healthPath: '/health' },
  redis: { url: 'redis://localhost:6379' },
  postgres: { url: 'postgresql://hydra_user:hydra_secure_password@localhost:5432/hydra' }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: Object.keys(services)
  });
});

// Authentication endpoints
app.post('/auth/login', authLimiter, [
  body('username').isLength({ min: 1 }).withMessage('Username required'),
  body('password').isLength({ min: 1 }).withMessage('Password required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  
  // In production, validate against database
  const validUsers = {
    'admin': '$2a$10$8K1p/a0dclxOXAMaQd4fce2B.CY6dGBFXTiPLuLlLRn4V6a4c3aK2' // password: hydra-admin
  };

  try {
    if (!validUsers[username] || !await bcrypt.compare(password, validUsers[username])) {
      logger.warn(`Failed login attempt for user: ${username}`, { ip: req.ip });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`Successful login for user: ${username}`, { ip: req.ip });
    res.json({ token, expiresIn: '24h' });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Service discovery endpoint
app.get('/api/services', authenticateToken, (req, res) => {
  res.json({ services });
});

// Proxy configuration for different services
const proxyOptions = {
  changeOrigin: true,
  onError: (err, req, res) => {
    logger.error('Proxy error:', { error: err.message, url: req.url });
    res.status(502).json({ error: 'Service unavailable' });
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add correlation ID for tracing
    proxyReq.setHeader('X-Correlation-ID', req.headers['x-correlation-id'] || `hydra-${Date.now()}-${Math.random()}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add gateway headers
    proxyRes.headers['X-Gateway'] = 'Hydra-API-Gateway';
    proxyRes.headers['X-Gateway-Version'] = '1.0.0';
  }
};

// Route to orchestrator
app.use('/api/orchestrator', createProxyMiddleware({
  target: services.orchestrator.url,
  ...proxyOptions,
  pathRewrite: { '^/api/orchestrator': '' }
}));

// Route to landing pages
app.use('/api/landing', createProxyMiddleware({
  target: services.landing.url,
  ...proxyOptions,
  pathRewrite: { '^/api/landing': '' }
}));

// Route to workers
app.use('/api/worker', createProxyMiddleware({
  target: services.worker.url,
  ...proxyOptions,
  pathRewrite: { '^/api/worker': '' }
}));

// Route to click tracker
app.use('/api/click', createProxyMiddleware({
  target: services.click.url,
  ...proxyOptions,
  pathRewrite: { '^/api/click': '' }
}));

// Service health monitoring
app.get('/api/health/services', authenticateToken, async (req, res) => {
  const healthChecks = {};
  
  for (const [name, service] of Object.entries(services)) {
    if (service.healthPath && service.url.startsWith('http')) {
      try {
        const response = await fetch(`${service.url}${service.healthPath}`);
        healthChecks[name] = {
          status: response.ok ? 'healthy' : 'unhealthy',
          statusCode: response.status,
          lastCheck: new Date().toISOString()
        };
      } catch (error) {
        healthChecks[name] = {
          status: 'unreachable',
          error: error.message,
          lastCheck: new Date().toISOString()
        };
      }
    }
  }
  
  res.json({ healthChecks });
});

// Metrics endpoint
app.get('/api/metrics', authenticateToken, async (req, res) => {
  try {
    // In production, integrate with proper metrics collection
    const metrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      requests_total: 'TODO: implement counter',
      response_times: 'TODO: implement histogram'
    };
    
    res.json({ metrics });
  } catch (error) {
    logger.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.headers['x-correlation-id']
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Hydra API Gateway running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    if (redisClient.isOpen) {
      redisClient.quit();
    }
    process.exit(0);
  });
});

module.exports = app;