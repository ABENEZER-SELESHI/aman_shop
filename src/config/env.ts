import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url().optional(),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: z.string().min(1).default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().min(1).default("7d"),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
    RESEND_API_KEY: z.string().optional().default(""),
    ORDER_NOTIFY_EMAIL: z.string().email(),
    EMAIL_FROM: z.string().min(1),
    SELLER_EMAIL: z.string().email().optional(),
    SELLER_PASSWORD: z.string().min(8).optional(),
    SELLER_NAME: z.string().min(1).optional(),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    ORDER_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  })
  .superRefine((value, ctx) => {
    if (value.JWT_ACCESS_SECRET === value.JWT_REFRESH_SECRET) {
      ctx.addIssue({
        code: "custom",
        path: ["JWT_REFRESH_SECRET"],
        message: "JWT access and refresh secrets must differ",
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => ({
    path: issue.path.join(".") || "(root)",
    message: issue.message,
  }));
  console.error("Invalid environment configuration:", details);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;

if (env.NODE_ENV === "production" && !env.RESEND_API_KEY) {
  console.warn(
    "WARN: RESEND_API_KEY is not set — order and password-reset emails are disabled until you add it in Render Environment.",
  );
}
