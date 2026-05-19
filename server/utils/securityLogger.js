const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
};

const getUserAgent = (req) => req.headers['user-agent'] || 'unknown';

const logSecurityEvent = (event, req, metadata = {}) => {
  const payload = {
    level: 'warn',
    type: 'security_event',
    event,
    ip: getClientIp(req),
    method: req.method,
    path: req.originalUrl,
    userAgent: getUserAgent(req),
    userId: req.user?.id || null,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  console.warn(JSON.stringify(payload));
};

const logAuthAttempt = (event, req, metadata = {}) => {
  logSecurityEvent(event, req, metadata);
};

const logApiError = (err, req, statusCode) => {
  const payload = {
    level: 'error',
    type: 'api_error',
    message: err.message,
    code: err.code || null,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    ip: getClientIp(req),
    method: req.method,
    path: req.originalUrl,
    userAgent: getUserAgent(req),
    userId: req.user?.id || null,
    statusCode,
    timestamp: new Date().toISOString(),
  };

  console.error(JSON.stringify(payload));
};

module.exports = {
  getClientIp,
  logSecurityEvent,
  logAuthAttempt,
  logApiError,
};
