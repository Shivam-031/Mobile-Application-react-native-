// Resolve the allowed CORS origins for the current environment.
// In production, CORS_ORIGINS is a comma-separated env var (e.g.
// "https://admin.greenyatra.in,https://app.greenyatra.in"). In development
// we accept the loopback origins callers usually hit.
const DEV_ORIGINS = ['http://localhost:3001', 'http://localhost:5000'];

const resolveOrigins = () => {
  if (process.env.NODE_ENV !== 'production') return DEV_ORIGINS;
  const list = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  // Fall back to the well-known admin domain so we don't ship a broken CORS
  // config if the env var was forgotten at deploy time. Logged loudly so it
  // shows up in Render deploy logs.
  if (list.length === 0) {
    // eslint-disable-next-line no-console
    console.warn('[cors] CORS_ORIGINS env var is empty — falling back to defaults');
    return [
      'https://admin.greenyatra.in',
      'https://green-yatra-admin.onrender.com',
    ];
  }
  return list;
};

module.exports = { resolveOrigins };
