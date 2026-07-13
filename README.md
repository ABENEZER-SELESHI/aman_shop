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

## Seller Studio

Password-protected admin at [/studio](http://localhost:3000/studio):

- Dashboard (orders + catalog overview)
- Orders (status: New → Confirmed → Completed / Cancelled)
- Products (add / edit / hide / delete)
- Activity logs
- Settings (change password)

Seed credentials come from the backend `.env` (`SELLER_EMAIL` / `SELLER_PASSWORD`). Default local seed:

- Email: `amanuel@amanshop.local`
- Password: `ChangeMeSeller123!`

Catalog is stored in PostgreSQL (Neon). The public shop loads products from `GET /api/v1/products` and falls back to `content/products.json` if the API is down.

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
