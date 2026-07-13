# Database Documentation

## ERD

```
sellers 1───* refresh_tokens
orders (standalone; no customer FK — guests only)
```

## Tables

### `sellers`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| email | text unique | |
| password_hash | text | bcrypt |
| name | text | |
| created_at / updated_at | timestamptz | |
| deleted_at | timestamptz nullable | soft delete |

### `refresh_tokens`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| token_hash | text unique | SHA-256 of raw token |
| seller_id | UUID FK → sellers ON DELETE CASCADE | |
| expires_at | timestamptz | indexed |
| revoked_at | timestamptz nullable | |
| created_at / updated_at | timestamptz | |

### `orders`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| reference | text unique | `AS-` + 6 chars |
| status | enum | new, confirmed, completed, cancelled |
| customer_name / customer_phone | text | |
| customer_note / preferred_pickup | text | |
| lines | jsonb | order line snapshot |
| subtotal_etb | int | |
| pay_in_person | boolean | always true in V1 |
| created_at / updated_at | timestamptz | |
| deleted_at | timestamptz nullable | soft delete ready |

## Indexes

- `orders(status)`, `orders(created_at)`, `orders(customer_phone)`
- `refresh_tokens(seller_id)`, `refresh_tokens(expires_at)`

## Neon

Production/dev cloud DB uses [Neon](https://neon.tech).

| Env var | Purpose |
|---------|---------|
| `DATABASE_URL` | Pooled connection (`…-pooler…`) for the running API — add `pgbouncer=true` |
| `DIRECT_URL` | Non-pooler host for `prisma migrate` / introspection |

Prisma `schema.prisma` sets `url` + `directUrl` accordingly.

## Migrations

Prisma migrations live in `prisma/migrations/`. Deploy with:

```bash
npx prisma migrate deploy
npm run prisma:seed
```
