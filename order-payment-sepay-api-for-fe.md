# Order + SePay Payment API For FE

This document describes how Frontend integrates checkout and payment status with backend SePay flow.

## Business Rules

- Payment method is **bank transfer only** (`BANK_TRANSFER`).
- Checkout supports both:
  - buying a single **course**
  - buying a **combo**
- Re-buying a course that user already owns is **allowed**.
- User can watch full video only after backend marks order `PAID` and creates enrollments.
- Before purchase, user can still view course/chapter/lesson titles and preview/free parts by existing backend rules.

---

## Auth

- `POST /orders/checkout`: requires `Authorization: Bearer <access_token>`.
- `GET /orders/:code/status`: requires `Authorization: Bearer <access_token>`.
- `POST /orders/ipn/sepay`: called by SePay server-to-server (no FE call).

---

## End-to-End Flow

1. FE calls `POST /orders/checkout`.
2. BE creates `PENDING` order and returns:
   - `checkoutURL`
   - `formFields`
3. FE renders HTML `<form>` and submits `POST` to SePay.
4. User completes transfer on SePay page.
5. SePay calls backend IPN endpoint `POST /orders/ipn/sepay`.
6. BE verifies IPN, marks order `PAID`, creates enrollments.
7. SePay redirects browser to FE success/error/cancel URL.
8. FE polls `GET /orders/:code/status` until `PAID`, then redirects user to success/learning page.

---

## 1) Create Checkout

### Endpoint

- **Method**: `POST`
- **Path**: `/orders/checkout`
- **Auth**: Bearer token

### Request body

Provide exactly one of `courseId` or `comboId`.

**Buy course**

```json
{
  "courseId": "uuid"
}
```

**Buy combo**

```json
{
  "comboId": "uuid"
}
```

### Success response (200)

```json
{
  "checkoutURL": "https://pay-sandbox.sepay.vn/v1/checkout/init",
  "formFields": {
    "merchant": "SP-xxxx",
    "operation": "PURCHASE",
    "payment_method": "BANK_TRANSFER",
    "order_invoice_number": "ORD-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "order_amount": "100000",
    "currency": "VND",
    "order_description": "Thanh toán khóa học: N1",
    "customer_id": "user-uuid",
    "success_url": "http://localhost:3001/checkout/success?order_code=ORD-...",
    "error_url": "http://localhost:3001/checkout/error?order_code=ORD-...",
    "cancel_url": "http://localhost:3001/checkout/cancel?order_code=ORD-...",
    "custom_data": "{\"orderCode\":\"ORD-...\",\"userId\":\"...\"}",
    "signature": "..."
  }
}
```

### Common errors

- `400`: invalid body, both IDs provided, no ID provided, item not published, invalid amount.
- `401`: missing/invalid token.
- `404`: course/combo not found.

---

## 2) Poll Order Status

### Endpoint

- **Method**: `GET`
- **Path**: `/orders/:code/status`
- **Auth**: Bearer token

Where `:code` is `orderCode` from checkout flow (value in `formFields.order_invoice_number`).

### Success response (200)

```json
{
  "orderCode": "ORD-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "status": "PENDING",
  "amount": 100000,
  "courseId": "uuid-or-null",
  "comboId": "uuid-or-null",
  "completedAt": null
}
```

When payment is completed:

```json
{
  "orderCode": "ORD-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "status": "PAID",
  "amount": 100000,
  "courseId": "uuid-or-null",
  "comboId": "uuid-or-null",
  "completedAt": "2026-03-26T12:34:56.000Z"
}
```

### Common errors

- `401`: missing/invalid token.
- `403`: order does not belong to current user.
- `404`: order code not found.

---

## 3) FE Implementation Example

### 3.1 Submit SePay form

```tsx
async function checkout(payload: { courseId?: string; comboId?: string }, accessToken: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Checkout failed');
  const data: { checkoutURL: string; formFields: Record<string, string> } = await res.json();

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = data.checkoutURL;

  Object.entries(data.formFields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
```

### 3.2 Poll payment status

```ts
async function pollOrderStatus(orderCode: string, accessToken: string) {
  const maxAttempts = 30;
  const intervalMs = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/orders/${encodeURIComponent(orderCode)}/status`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) throw new Error('Cannot get order status');
    const data = await res.json();

    if (data.status === 'PAID') {
      return data;
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error('Payment confirmation timeout');
}
```

---

## FE Pages Suggested

- `/checkout/success`: read `order_code` query, poll status, redirect to learning page when `PAID`.
- `/checkout/error`: show payment error and retry action.
- `/checkout/cancel`: show canceled state and return to course/combo detail.

---

## Notes

- FE should never call IPN endpoint.
- FE should not trust redirect alone; always verify by polling order status.
- Response fields from SePay form are sensitive for signature integrity; FE should submit exactly what backend returns.
