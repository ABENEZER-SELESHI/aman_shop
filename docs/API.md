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

Fetch order by public reference code.

## Orders (seller — Bearer access token)

### `GET /api/v1/orders?status=&limit=&offset=`

List orders. Optional `status`: `NEW` | `CONFIRMED` | `COMPLETED` | `CANCELLED`.

### `PATCH /api/v1/orders/:reference/status`

**Body:** `{ "status": "CONFIRMED" }`

Allowed transitions:

- `NEW` → `CONFIRMED` | `CANCELLED`
- `CONFIRMED` → `COMPLETED` | `CANCELLED`
- Terminal: `COMPLETED`, `CANCELLED`

## Auth (seller)

### `POST /api/v1/auth/login`

**Body:** `{ "email", "password" }` → `{ accessToken, refreshToken, seller }`

### `POST /api/v1/auth/refresh`

**Body:** `{ "refreshToken" }` → new token pair (rotation).

### `POST /api/v1/auth/logout`

**Body:** `{ "refreshToken" }` → revokes refresh token.
