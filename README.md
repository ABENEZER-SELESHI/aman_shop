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
docker compose up -d postgres
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

API base: `http://localhost:4000/api/v1`

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled server |
| `npm test` | Unit tests |
| `npm run test:coverage` | Coverage report |
| `npm run prisma:migrate` | Create/apply migrations (dev) |
| `npm run prisma:deploy` | Apply migrations (prod) |
| `npm run prisma:seed` | Seed seller account |

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
