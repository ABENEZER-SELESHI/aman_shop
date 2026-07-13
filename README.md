# Aman Shop — Backend API

Express + TypeScript + PostgreSQL (Prisma) API for **Aman Shop** order requests and seller authentication.

Customers never create accounts. Checkout creates an **order request** only — payment is in person at pickup. The API stores the order and emails the seller via Resend.

## Stack

- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT access + refresh tokens (seller only)
- Resend for order notification email
- Helmet, CORS, rate limiting, Zod validation

## Quick start

```bash
cp .env.example .env
# Set DATABASE_URL + DIRECT_URL to your Neon (or local) Postgres URLs
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

API base: `http://localhost:4000/api/v1`

Local Docker Postgres is optional — see `docker compose up -d postgres` if you prefer not to use Neon locally.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start with hot reload |
| `npm run build` | Prisma generate + compile TypeScript + copy catalog JSON |
| `npm start` | Run compiled server |
| `npm test` | Unit tests |
| `npm run test:coverage` | Coverage report |
| `npm run prisma:migrate` | Create/apply migrations (dev) |
| `npm run prisma:deploy` | Apply migrations (prod) |
| `npm run prisma:seed` | Seed seller account |

## Deploy (Render)

Use the **`backend`** branch.

- **Build command:** `npm install; npm run build`
- **Start command:** `npm start` (or `npx prisma migrate deploy && npm start` on first deploy)
- TypeScript and `@types/*` live in `dependencies` so production `npm install` still can compile

Set env vars from `.env.example` in the Render **Environment** panel (not a committed `.env` file): Neon `DATABASE_URL` / `DIRECT_URL`, JWT secrets, `CORS_ORIGIN` (include your frontend URL), `ORDER_NOTIFY_EMAIL`, `EMAIL_FROM`.

`RESEND_API_KEY` is optional to boot — without it the API runs but order/password emails are skipped. Add a Resend key when you are ready to notify the seller.

## Environment

See `.env.example`. Required: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ORDER_NOTIFY_EMAIL`.

`RESEND_API_KEY` is optional in development (email is logged and skipped when missing).

## Docker

```bash
cp .env.example .env
# set JWT secrets and ORDER_NOTIFY_EMAIL
docker compose up --build
```

## Architecture

Clean layered structure:

- **routes** → **controllers** → **services** → **repositories** → Prisma
- Controllers contain no business logic or direct DB access
- Validators (Zod) sit at the HTTP boundary

Docs: [`docs/API.md`](docs/API.md) · [`docs/DATABASE.md`](docs/DATABASE.md) · [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
