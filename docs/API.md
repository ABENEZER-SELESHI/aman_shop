# API Documentation — Aman Shop `/api/v1`

All responses use a standard envelope.

**Success**

```json
{ "success": true, "message": "", "data": {} }
```

**Error**

```json
{ "success": false, "message": "", "errors": [] }
```

## Health

### `GET /api/v1/health`

Returns service status.

## Orders (public)

### `POST /api/v1/orders`

Create an order request. Rate-limited more tightly than general traffic.

**Body**

| Field | Type | Rules |
|-------|------|-------|
| `customerName` | string | 2–80 chars |
| `customerPhone` | string | Ethiopian `09…` / `07…` or `+251…` |
| `preferredPickup` | enum | `Weekday morning`, `Weekday afternoon`, `Weekend`, `Flexible / message me` |
| `customerNote` | string | optional, max 400 |
| `lines` | array | 1–50 line items |
| `lines[].productId` | string | required |
| `lines[].name` | string | required |
| `lines[].unitPriceEtb` | int | ≥ 0 |
| `lines[].quantity` | int | 1–100 |
| `subtotalEtb` | int | must equal Σ(unitPrice × qty) |

**Response `201`:** order with `reference` (e.g. `AS-7F3K2A`), status `NEW`, `payInPerson: true`.

Side effects: persist order; send seller email via Resend (when configured).

### `GET /api/v1/orders/:reference`

Public confirmation lookup. Returns a **masked** order view (no full phone, no customer note).

### `GET /api/v1/live`

Liveness probe (no DB).

### `GET /api/v1/ready`

Readiness probe — pings PostgreSQL; `503` if down.

## Auth (seller)

### `POST /api/v1/auth/login`

**Body:** `{ "email", "password" }` → `{ accessToken, refreshToken, seller }`  
Rate limit: 5 / minute.

### `POST /api/v1/auth/refresh`

**Body:** `{ "refreshToken" }` → new token pair (rotation). Reuse of a rotated token revokes all sessions.

### `POST /api/v1/auth/logout`

**Body:** `{ "refreshToken" }` → revokes refresh token.

### `POST /api/v1/auth/forgot-password`

**Body:** `{ "email" }` — always returns a generic success message (no email enumeration).  
Rate limit: 3 / hour. Reset tokens expire in **15 minutes**, are one-time, and are stored hashed.

### `POST /api/v1/auth/reset-password`

**Body:** `{ "token", "password" }` — invalidates reset token and all refresh sessions.

### `POST /api/v1/auth/change-password`

Bearer required. **Body:** `{ "currentPassword", "newPassword" }`.
