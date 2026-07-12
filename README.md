# Aman Shop — Frontend

Boutique storefront for **Amanuel**'s handmade flower vases and baskets.

Customers browse the catalog, add quantities to a cart, and submit an **order request**. Payment is **in person only** at pickup — this site never takes online payments.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Zustand (cart + `localStorage` key `aman-shop:cart:v1`)
- TanStack Query, Axios, Zod, React Hook Form
- Fraunces + Outfit fonts

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The order API defaults to `http://localhost:4000/api/v1` (see backend README).

## Editing the catalog

1. Edit `content/products.json`
2. Replace images under `public/products/` (and hero under `public/hero/`)
3. Restart / rebuild if needed

Fields match the product type in `src/types/index.ts`.

## Environment

See `.env.example` for brand, seller contact, and API base URL.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest |

## Deploy

Deploy the frontend on **Vercel**. Set the env vars from `.env.example`, pointing `NEXT_PUBLIC_API_BASE_URL` at your hosted backend.

## Note

No online payments by design. Checkout creates an order request and notifies the seller via the backend (Resend).
