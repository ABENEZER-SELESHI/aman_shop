export const siteConfig = {
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Aman Shop",
  makerName: process.env.NEXT_PUBLIC_MAKER_NAME ?? "Amanuel",
  currency: process.env.NEXT_PUBLIC_CURRENCY ?? "ETB",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  sellerPhone: process.env.NEXT_PUBLIC_SELLER_PHONE ?? "+251911000000",
  sellerWhatsapp: process.env.NEXT_PUBLIC_SELLER_WHATSAPP ?? "251911000000",
  sellerEmail: process.env.NEXT_PUBLIC_SELLER_EMAIL ?? "hello@amanshop.local",
  pickupNote:
    process.env.NEXT_PUBLIC_PICKUP_NOTE ?? "CMC, Addis Ababa — by appointment",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1",
} as const;

export const CART_STORAGE_KEY = "aman-shop:cart:v1";
