const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { getClientIp, logSecurityEvent } = require('../utils/securityLogger');

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const securityHeaders = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

const enforceHttps = (req, res, next) => {
  const shouldEnforce = process.env.NODE_ENV === 'production' || process.env.ENFORCE_HTTPS === 'true';
  if (!shouldEnforce) {
    return next();
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  if (req.secure || forwardedProto === 'https') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'HTTPS is required',
  });
};

const requestLogger = (req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const statusCode = res.statusCode;

    if (statusCode >= 400 || durationMs > 3000) {
      logSecurityEvent('request_anomaly', req, {
        statusCode,
        durationMs,
      });
    }
  });
  next();
};

const suspiciousAgentPattern = /(bot|crawler|spider|scraper|python-requests|wget|curl|httpclient)/i;

const blockSuspiciousAgents = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const allowLocalDev = process.env.NODE_ENV !== 'production';

  if (!allowLocalDev && suspiciousAgentPattern.test(userAgent)) {
    logSecurityEvent('blocked_suspicious_user_agent', req, { userAgent });
    return res.status(403).json({
      success: false,
      message: 'Automated access is blocked',
    });
  }

  return next();
};

const buildLimiter = ({ windowMs, max, message, eventName, keyByUser = false }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      if (keyByUser && req.user?.id) {
        return `user:${req.user.id}`;
      }
      return getClientIp(req);
    },
    handler: (req, res) => {
      logSecurityEvent(eventName, req, {
        limit: max,
        windowMs,
      });
      res.status(429).json({
        success: false,
        message,
      });
    },
  });

const apiLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: parsePositiveInt(process.env.API_RATE_LIMIT_MAX, 300),
  message: 'Too many requests. Please slow down.',
  eventName: 'api_rate_limit_exceeded',
});

const loginLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: parsePositiveInt(process.env.LOGIN_RATE_LIMIT_MAX, 5),
  message: 'Too many login attempts. Please try again later.',
  eventName: 'login_rate_limit_exceeded',
});

const registerLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  max: parsePositiveInt(process.env.REGISTER_RATE_LIMIT_MAX, 5),
  message: 'Too many account creation attempts. Please try again later.',
  eventName: 'register_rate_limit_exceeded',
});

const aiLimiter = buildLimiter({
  windowMs: 60 * 1000,
  max: parsePositiveInt(process.env.AI_RATE_LIMIT_MAX, 20),
  message: 'Too many AI requests. Please wait a minute and retry.',
  eventName: 'ai_rate_limit_exceeded',
  keyByUser: true,
});

module.exports = {
  securityHeaders,
  enforceHttps,
  requestLogger,
  blockSuspiciousAgents,
  apiLimiter,
  loginLimiter,
  registerLimiter,
  aiLimiter,
};
