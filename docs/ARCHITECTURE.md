# Backend Architecture

## Layers

1. **Routes** — versioned HTTP surface (`/api/v1`)
2. **Controllers** — map HTTP ↔ DTO; no business logic
3. **Validators** — Zod schemas at the boundary
4. **Services** — business rules (orders, auth, email)
5. **Repositories** — Prisma data access behind interfaces
6. **Middleware** — auth, rate limits, request IDs, errors

## Security

- Helmet secure headers
- CORS allowlist via `CORS_ORIGIN`
- Global + endpoint rate limits
- bcrypt password hashing (cost 12)
- JWT access (short-lived) + hashed refresh tokens with rotation
- Zod validation on all mutating bodies
- Prisma parameterized queries (SQL injection protection)
- No secrets in source; env validated with Zod at boot

## Order flow

1. Validate body + phone + subtotal
2. Generate unique `AS-XXXXXX` reference
3. Persist order (`NEW`, `pay_in_person=true`)
4. Fire-and-forget Resend email to seller
5. Return order to client

Catalog pricing lives on the frontend JSON catalog; the API stores the cart snapshot submitted at checkout.
