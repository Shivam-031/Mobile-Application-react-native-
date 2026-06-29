const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const { initFirebase } = require('./config/firebase');
const { resolveOrigins } = require('./config/cors');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = resolveOrigins();

// Connect to MongoDB
connectDB();

// Initialize Firebase Admin (for push notifications)
initFirebase();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients (curl, server-to-server) with no Origin header.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

// General rate limiter — applied to everything under /api/
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
});
app.use('/api/', apiLimiter);

// Stricter limiter for credential endpoints — login is the brute-force target.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again in 15 minutes.',
});
// Apply only to POST /auth/login and /auth/register — refresh + forgot-password
// are also user-visible so we count them toward the same bucket.
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging. Default presets (`dev`, `combined`) don't redact
// tokens from query strings, so we install our own format with redaction
// for JWT-ish fields. Set LOG_LEVEL=silent in production to mute
// access logs (useful when shipping to Render and forwarding only errors
// to Sentry).
if (process.env.NODE_ENV !== 'test' && process.env.LOG_LEVEL !== 'silent') {
  morgan.token('safe-url', (req) => {
    const url = req.originalUrl || req.url;
    return url.replace(/([?&])(token|access_token|accessToken|refreshToken)=[^&]+/gi, '$1$2=<redacted>');
  });
  morgan.token('safe-body', (req) => {
    if (isProduction) return '';
    const b = req.body;
    if (!b || typeof b !== 'object') return '';
    const clone = { ...b };
    for (const k of ['password', 'token', 'accessToken', 'refreshToken', 'adminKey', 'employeeKey']) {
      if (clone[k] !== undefined) clone[k] = '<redacted>';
    }
    return Object.keys(clone).length ? JSON.stringify(clone) : '';
  });
  app.use(morgan(':remote-addr - :method :safe-url :status :res[content-length] - :response-time ms :safe-body'));
}

// Health checks.
// - /healthz: Render's default probe — returns 200 OK plain text.
// - /health:  JSON variant with version info for manual smoke tests.
app.get('/healthz', (req, res) => res.status(200).send('OK'));
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: '🌿 Green Yatra India API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/v1', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🌿 Green Yatra India API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  if (isProduction && !process.env.CORS_ORIGINS) {
    // eslint-disable-next-line no-console
    console.warn('[startup] CORS_ORIGINS not set in production — using defaults');
  }
});

module.exports = app;
