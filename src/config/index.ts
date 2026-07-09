import { env } from "./env.js";

export const config = {
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  corsOrigin: env.CORS_ORIGIN,
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  email: {
    resendApiKey: env.RESEND_API_KEY,
    orderNotifyEmail: env.ORDER_NOTIFY_EMAIL,
    from: env.EMAIL_FROM,
  },
  seedSeller: {
    email: env.SELLER_EMAIL,
    password: env.SELLER_PASSWORD,
    name: env.SELLER_NAME,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    orderMax: env.ORDER_RATE_LIMIT_MAX,
  },
} as const;

export { env } from "./env.js";
