import dotenv from 'dotenv';
import path from 'path';

// Load .env file from backend root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/nirikshan',
  JWT_SECRET: process.env.JWT_SECRET || 'nirikshan_jwt_super_secret_dev_key_min_32_chars!',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_NAME: 'nirikshan_token',
  COOKIE_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
};
