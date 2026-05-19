const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Security configuration error: ${message}`);
  }
};

const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  assert(process.env.DATABASE_URL, 'DATABASE_URL is required');
  assert(process.env.JWT_SECRET, 'JWT_SECRET is required');

  const jwtSecret = process.env.JWT_SECRET || '';
  const weakSecrets = ['your_secure_random_secret_key_here_min_32_chars', 'changeme', 'secret'];
  assert(jwtSecret.length >= 32, 'JWT_SECRET must be at least 32 characters');
  assert(!weakSecrets.includes(jwtSecret.toLowerCase()), 'JWT_SECRET is too weak');

  if (isProduction) {
    assert(
      process.env.ENFORCE_HTTPS !== 'false',
      'ENFORCE_HTTPS cannot be disabled in production'
    );
    assert(
      process.env.DB_PRIVATE_NETWORK_ONLY === 'true',
      'Set DB_PRIVATE_NETWORK_ONLY=true and restrict database network access to private networks only'
    );
  }
};

module.exports = validateEnv;
