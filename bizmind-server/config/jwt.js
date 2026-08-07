export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'bizmind_ai_fallback_jwt_secret_key_2026',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
