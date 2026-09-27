const { X509Certificate } = require('node:crypto');

module.exports = function databaseOptions(env = process.env) {
  const fail = message => { throw new Error(`Security configuration error: ${message}`); };
  let url;
  try { url = new URL(env.DATABASE_URL); } catch { fail('DATABASE_URL must be a complete PostgreSQL URL'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || url.pathname.length < 2) {
    fail('DATABASE_URL must include a PostgreSQL hostname and database');
  }
  // Construct explicit driver options: URL SSL parameters must not override TLS verification.
  for (const name of url.searchParams.keys()) {
    if (!['sslmode', 'ssl', 'application_name'].includes(name)) {
      fail('Unsupported DATABASE_URL parameter; configure certificates with DATABASE_SSL_CA');
    }
  }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const plaintext = env.NODE_ENV !== 'production' && local && env.DATABASE_SSL_MODE === 'disable';
  if (env.DATABASE_SSL_MODE && !['verify-full', 'disable'].includes(env.DATABASE_SSL_MODE)) {
    fail('DATABASE_SSL_MODE must be verify-full or disable');
  }
  if (!plaintext && (env.DATABASE_SSL_MODE === 'disable' || url.searchParams.get('sslmode') === 'disable' || url.searchParams.get('ssl') === 'false')) {
    fail('Database TLS can only be disabled for local development');
  }
  const ssl = { rejectUnauthorized: true };
  if (env.DATABASE_SSL_CA) {
    const ca = env.DATABASE_SSL_CA.replace(/\\n/g, '\n');
    try { new X509Certificate(ca); } catch { fail('DATABASE_SSL_CA must contain a PEM CA certificate'); }
    ssl.ca = ca;
  }
  let user, password, database;
  try {
    user = decodeURIComponent(url.username);
    password = decodeURIComponent(url.password);
    database = decodeURIComponent(url.pathname.slice(1));
  } catch { fail('DATABASE_URL contains invalid encoding'); }
  return {
    host: url.hostname.replace(/^\[|\]$/g, ''),
    port: Number(url.port || 5432), user, password, database,
    application_name: url.searchParams.get('application_name') || 'sealed-api',
    ssl: plaintext ? false : ssl,
    connectionTimeoutMillis: 10000,
  };
};
