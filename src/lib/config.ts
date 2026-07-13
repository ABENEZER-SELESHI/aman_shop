import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_BRAND_NAME: z.string().optional(),
  NEXT_PUBLIC_MAKER_NAME: z.string().optional(),
  NEXT_PUBLIC_CURRENCY: z.string().optional(),
  NEXT_PUBLIC_SELLER_PHONE: z.string().optional(),
  NEXT_PUBLIC_SELLER_WHATSAPP: z.string().optional(),
  NEXT_PUBLIC_SELLER_EMAIL: z.string().email().optional(),
  NEXT_PUBLIC_PICKUP_NOTE: z.string().optional(),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_BRAND_NAME: process.env.NEXT_PUBLIC_BRAND_NAME,
  NEXT_PUBLIC_MAKER_NAME: process.env.NEXT_PUBLIC_MAKER_NAME,
  NEXT_PUBLIC_CURRENCY: process.env.NEXT_PUBLIC_CURRENCY,
  NEXT_PUBLIC_SELLER_PHONE: process.env.NEXT_PUBLIC_SELLER_PHONE,
  NEXT_PUBLIC_SELLER_WHATSAPP: process.env.NEXT_PUBLIC_SELLER_WHATSAPP,
  NEXT_PUBLIC_SELLER_EMAIL: process.env.NEXT_PUBLIC_SELLER_EMAIL,
  NEXT_PUBLIC_PICKUP_NOTE: process.env.NEXT_PUBLIC_PICKUP_NOTE,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

if (!parsed.success) {
  throw new Error(`Invalid frontend environment: ${parsed.error.message}`);
}

const isProd = process.env.NODE_ENV === "production";
const apiBaseUrl = parsed.data.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
const siteUrl = parsed.data.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const assertHttpsWhenRemote = (label: string, value: string | undefined) => {
  if (!isProd || !value) return;
  if (value.includes("localhost") || value.includes("127.0.0.1")) return;
  if (!value.startsWith("https://")) {
    throw new Error(`${label} must be an https URL in production`);
  }
};

assertHttpsWhenRemote("NEXT_PUBLIC_API_BASE_URL", parsed.data.NEXT_PUBLIC_API_BASE_URL);
assertHttpsWhenRemote("NEXT_PUBLIC_SITE_URL", parsed.data.NEXT_PUBLIC_SITE_URL);

export const siteConfig = {
  brandName: parsed.data.NEXT_PUBLIC_BRAND_NAME ?? "Aman Shop",
  makerName: parsed.data.NEXT_PUBLIC_MAKER_NAME ?? "Amanuel",
  currency: parsed.data.NEXT_PUBLIC_CURRENCY ?? "ETB",
  siteUrl,
  sellerPhone: parsed.data.NEXT_PUBLIC_SELLER_PHONE ?? "+251980650170",
  sellerWhatsapp: parsed.data.NEXT_PUBLIC_SELLER_WHATSAPP ?? "251905171013",
  sellerEmail: parsed.data.NEXT_PUBLIC_SELLER_EMAIL ?? "amanuelseleshi26@gmail.com",
  pickupNote:
    parsed.data.NEXT_PUBLIC_PICKUP_NOTE ?? "CMC, Addis Ababa — by appointment",
  apiBaseUrl,
} as const;

export const CART_STORAGE_KEY = "aman-shop:cart:v1";
