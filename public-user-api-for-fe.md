# Public User API For FE

This document lists all **public** endpoints for user-facing screens.

- Base URL (local): `http://localhost:3000`
- No global API prefix is configured.
- Public means **no `Authorization` header** is required.

---

## 1) Courses

### 1.1 List Published Courses

- **Method**: `GET`
- **Path**: `/courses`
- **Auth**: Public

Query params (`PublishedCourseListQueryDto`):

- `categoryId?: string` (UUID)
- `categorySlug?: string` (max length: `200`)

Example:

```http
GET /courses?categorySlug=tieng-nhat-n1
```

### 1.2 Course Detail By Slug

- **Method**: `GET`
- **Path**: `/courses/slug/:slug`
- **Auth**: Public

Path params:

- `slug: string`

Example:

```http
GET /courses/slug/tieng-nhat-n1
```

---

## 2) Categories

### 2.1 List Categories

- **Method**: `GET`
- **Path**: `/categories`
- **Auth**: Public
- **Params/Body**: none

### 2.2 Category Detail By Slug

- **Method**: `GET`
- **Path**: `/categories/slug/:slug`
- **Auth**: Public

Path params:

- `slug: string`

Example:

```http
GET /categories/slug/tieng-nhat
```

---

## 3) Combos

### 3.1 List Published Combos

- **Method**: `GET`
- **Path**: `/combos`
- **Auth**: Public

Query params (`AdminComboListQueryDto` + `PaginationQueryDto`):

- `page?: number` (int, min: `1`)
- `limit?: number` (int, min: `1`, max: `100`)
- `q?: string` (max length: `200`)
- `sort?: 'title_asc' | 'title_desc' | 'price_asc' | 'price_desc' | 'created_desc'`

Example:

```http
GET /combos?page=1&limit=20
```

### 3.2 Combo Detail By Slug

- **Method**: `GET`
- **Path**: `/combos/slug/:slug`
- **Auth**: Public

Path params:

- `slug: string`

Example:

```http
GET /combos/slug/frontend-bundle
```

---

## 4) Auth (Public Endpoints)

### 4.1 Register

- **Method**: `POST`
- **Path**: `/auth/register`
- **Auth**: Public

Body (`RegisterDto`):

- `email: string` (email format)
- `password: string` (min length: `6`)
- `fullName: string`

Example:

```json
{
  "email": "user@example.com",
  "password": "123456",
  "fullName": "Nguyen Van A"
}
```

### 4.2 Login

- **Method**: `POST`
- **Path**: `/auth/login`
- **Auth**: Public

Body (`LoginDto`):

- `email: string` (email format)
- `password: string`

Example:

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

### 4.3 Google OAuth Start

- **Method**: `GET`
- **Path**: `/auth/google`
- **Auth**: Public
- **Params/Body**: none
- **Behavior**: redirect to Google OAuth

### 4.4 Google OAuth Callback

- **Method**: `GET`
- **Path**: `/auth/google/callback`
- **Auth**: Public
- **Params/Body**: handled by Passport Google guard
- **Behavior**: redirect to frontend callback URL with query:
  - `access_token: string`
  - `refresh_token: string`
  - or `error: string`

---

## Not Public (for FE reference)

These endpoints are user-facing but require login, so they are not part of the public list:

- `GET /auth/me`
- `POST /auth/logout`
- `GET /lesson-parts/:id/watch`
- `POST /orders/checkout`
- `GET /orders/:code/status`
