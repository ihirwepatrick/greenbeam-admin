# Greenbeam Admin API — One-Shot Integration Guide

Complete reference for integrating the **admin frontend** with the Greenbeam backend. Only **mounted and implemented** endpoints are documented. All admin routes require a valid JWT with role `ADMIN`.

---

## Table of contents

1. [Base URL & headers](#1-base-url--headers)
2. [Authentication](#2-authentication)
3. [Standard response & errors](#3-standard-response--errors)
4. [Dashboard](#4-dashboard)
5. [Settings](#5-settings)
6. [Products](#6-products)
7. [Upload (files)](#7-upload-files)
8. [Orders (admin)](#8-orders-admin)
9. [Payments (admin)](#9-payments-admin)
10. [Cart (admin)](#10-cart-admin)
11. [Enquiries](#11-enquiries)
12. [Frontend integration examples](#12-frontend-integration-examples)

---

## 1. Base URL & headers

| Item | Value |
|------|--------|
| **Base URL** | `https://api.greenbeam.online/api/v1` (production) or `http://localhost:PORT/api/v1` (dev) |
| **Auth header** | `Authorization: Bearer <token>` on every admin request |
| **Content-Type** | `application/json` for JSON bodies; `multipart/form-data` for product create/update and file uploads |

---

## 2. Authentication

### 2.1 Login (get admin token)

**Request**

```http
POST /api/v1/auth/login
Content-Type: application/json
```

**Body**

| Field | Type | Required | Rules |
|-------|------|----------|--------|
| email | string | Yes | Valid email |
| password | string | Yes | Min 6 characters |

```json
{
  "email": "admin@greenbeam.com",
  "password": "admin123"
}
```

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "clxxx...",
      "email": "admin@greenbeam.com",
      "name": "Admin",
      "role": "ADMIN",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error responses**

| Status | code | When |
|--------|------|------|
| 401 | INVALID_CREDENTIALS | Wrong email or password |
| 400 | VALIDATION_ERROR | Invalid body (e.g. missing email, short password) |
| 500 | INTERNAL_SERVER_ERROR | Server error |

**Default admin (after seed):** Email `admin@greenbeam.com`, Password `admin123` (or from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env).

### 2.2 Profile (optional, for admin UI)

**Request**

```http
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "email": "admin@greenbeam.com",
    "name": "Admin",
    "role": "ADMIN",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 3. Standard response & errors

- **Success:** `{ "success": true, "data": { ... } }` — optional `message` in some endpoints.
- **Error:** `{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human message" } }`.
- **Validation error (400):** May include `error.details` array with `message`, `path`, `type`, `context`.

**Common error codes**

| code | HTTP | Meaning |
|------|------|---------|
| NO_TOKEN | 401 | Missing `Authorization` header |
| INVALID_TOKEN / TOKEN_EXPIRED | 401 | Bad or expired JWT |
| FORBIDDEN | 403 | Not admin (role !== ADMIN) |
| VALIDATION_ERROR | 400 | Invalid query or body |
| ORDER_NOT_FOUND | 404 | Order id not found |
| PAYMENT_NOT_FOUND | 404 | Payment id not found |
| ENQUIRY_NOT_FOUND | 404 | Enquiry id not found |
| PRODUCT_NOT_FOUND | 404 | Product id not found |
| INTERNAL_SERVER_ERROR | 500 | Unexpected server error |

---

## 4. Dashboard

All dashboard routes: **GET**, require **admin token**.

### 4.1 Dashboard stats

**Request**

```http
GET /api/v1/dashboard/stats
Authorization: Bearer <token>
```

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "products": {
      "total": 10,
      "available": 8,
      "categories": 3,
      "newThisMonth": 2,
      "categoryBreakdown": [{ "category": "Solar", "count": 5 }]
    },
    "enquiries": {
      "total": 20,
      "new": 5,
      "inProgress": 3,
      "responded": 10,
      "closed": 2,
      "responseRate": 50,
      "priorityBreakdown": [{ "priority": "HIGH", "count": 2 }],
      "recent": 7
    },
    "notifications": { "total": 15, "unread": 4, "read": 11 },
    "emails": { "total": 30, "sent": 28, "failed": 2, "successRate": 93.3 },
    "activity": {
      "recentEnquiries": 7,
      "recentProducts": 2,
      "recentEnquiryList": [
        {
          "id": "clxxx",
          "customerName": "John",
          "product": "Solar Panel",
          "status": "NEW",
          "priority": "MEDIUM",
          "createdAt": "2024-01-15T10:00:00.000Z"
        }
      ]
    },
    "system": {
      "status": "online",
      "lastBackup": "2024-01-14T00:00:00.000Z",
      "storageUsed": "2.3GB",
      "uptime": "99.9%"
    }
  }
}
```

### 4.2 Chart data

**Request**

```http
GET /api/v1/dashboard/charts?period=30
Authorization: Bearer <token>
```

**Query**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| period | number | 30 | Number of days for analytics |

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "enquiriesOverTime": [{ "date": "2024-01-01", "count": 5 }],
    "productCategories": [{ "category": "Solar", "count": 5 }],
    "enquiryStatus": [{ "status": "NEW", "count": 3 }],
    "priorityDistribution": [{ "priority": "HIGH", "count": 2 }],
    "emailMetrics": [
      {
        "date": "2024-01-01",
        "total": 10,
        "sent": 9,
        "failed": 1,
        "successRate": "90.0"
      }
    ]
  }
}
```

### 4.3 Recent activity

**Request**

```http
GET /api/v1/dashboard/activity?limit=20
Authorization: Bearer <token>
```

**Query**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | number | 20 | Max activities to return |

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "type": "enquiry",
        "id": "clxxx",
        "title": "New enquiry from John",
        "description": "Enquiry for Solar Panel",
        "timestamp": "2024-01-15T10:00:00.000Z",
        "data": {
          "customerName": "John",
          "product": "Solar Panel",
          "status": "NEW",
          "priority": "MEDIUM"
        }
      }
    ],
    "summary": {
      "totalEnquiries": 5,
      "totalProducts": 5,
      "totalNotifications": 10
    }
  }
}
```

---

## 5. Settings

All settings routes require **admin token**. Settings are key-value per category.

### 5.1 Initialize default settings

**Request**

```http
POST /api/v1/settings/initialize
Authorization: Bearer <token>
```

**Body:** none.

**Success response** `200` — `{ "success": true, "data": { ... } }` (structure depends on controller).

### 5.2 Get all settings

**Request**

```http
GET /api/v1/settings
Authorization: Bearer <token>
```

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "website": { "siteName": "Greenbeam", "logo": "..." },
    "general": { "supportEmail": "support@greenbeam.com" }
  }
}
```

### 5.3 Get settings by category

**Request**

```http
GET /api/v1/settings/:category
Authorization: Bearer <token>
```

Example: `GET /api/v1/settings/website`

**Success response** `200` — `data` is an object of key-value for that category.

### 5.4 Update settings by category

**Request**

```http
PUT /api/v1/settings/:category
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:** Plain object; keys are setting keys, values can be string, number, boolean, or object (stored as JSON).

```json
{
  "siteName": "Greenbeam",
  "supportEmail": "support@greenbeam.com"
}
```

**Success response** `200` — `{ "success": true, "data": { ... } }`.

### 5.5 Update single setting

**Request**

```http
PUT /api/v1/settings/:category/:key
Authorization: Bearer <token>
Content-Type: application/json
```

**Body**

```json
{ "value": "New value" }
```

`value` can be string, number, boolean, or object. **Required.**

**Success response** `200`.

### 5.6 Delete single setting

**Request**

```http
DELETE /api/v1/settings/:category/:key
Authorization: Bearer <token>
```

**Success response** `200`.

### 5.7 Website sub-routes (convenience)

All require **admin token**. `GET` returns `{ "success": true, "data": { ... } }` with the subset; `PUT` accepts a body object for that subset.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/settings/website/flattened` | Website settings flattened |
| PUT | `/api/v1/settings/website/nested` | Update website (nested body) |
| GET/PUT | `/api/v1/settings/website/branding` | Branding |
| GET/PUT | `/api/v1/settings/website/content` | Content |
| GET/PUT | `/api/v1/settings/website/seo` | SEO |
| GET/PUT | `/api/v1/settings/website/social` | Social |
| GET/PUT | `/api/v1/settings/website/features` | Features |
| GET/PUT | `/api/v1/settings/website/layout` | Layout |
| GET/PUT | `/api/v1/settings/website/performance` | Performance |
| GET/PUT | `/api/v1/settings/website/customization` | Customization |

---

## 6. Products

Product **read** (list, get by id) is **public**. **Create, update, delete** require **admin token**.

### 6.1 Create product (admin)

**Request**

```http
POST /api/v1/products
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form fields (all from product schema; files optional)**

| Field | Type | Required | Rules |
|-------|------|----------|--------|
| name | string | Yes | 2–255 chars |
| category | string | Yes | 2–100 chars |
| description | string | No | Max 2000 |
| price | number | Yes | Positive, 2 decimals |
| features | array or JSON string | No | Array of strings |
| specifications | object or JSON string | No | Object |
| status | string | No | `AVAILABLE` \| `NOT_AVAILABLE` (default AVAILABLE) |
| image | file | No | Main image (1 file) |
| images | files | No | Up to 9 additional images |

**Example (multipart):**  
`name=Solar Panel&category=Solar&price=299.99&status=AVAILABLE` + file field `image` and/or `images[]`.

**Success response** `201`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Solar Panel",
    "category": "Solar",
    "description": null,
    "price": "299.99",
    "image": "https://...",
    "features": [],
    "specifications": null,
    "rating": "0",
    "reviews": 0,
    "status": "AVAILABLE",
    "images": ["https://..."],
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error responses:** 400 (VALIDATION_ERROR), 403 (FORBIDDEN), 500.

### 6.2 Update product (admin)

**Request**

```http
PUT /api/v1/products/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form fields:** Same as create; all **optional**. Only send fields you want to change. Same file fields: `image` (1), `images` (up to 9). Sending new `images` **replaces** existing additional images.

**Success response** `200` — same product object shape as create.

**Error responses:** 400 (VALIDATION_ERROR), 404 (PRODUCT_NOT_FOUND), 403, 500.

### 6.3 Delete product (admin)

**Request**

```http
DELETE /api/v1/products/:id
Authorization: Bearer <token>
```

**Success response** `200` — `{ "success": true, "data": { ... }, "message": "..." }`.

**Error responses:** 404 (PRODUCT_NOT_FOUND), 403, 500.

### 6.4 List products (public; useful for admin UI)

**Request**

```http
GET /api/v1/products?page=1&limit=10&category=Solar&status=AVAILABLE&search=panel&sortBy=createdAt&sortOrder=desc
```

**Query**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Per page (1–100) |
| search | string | - | Search name/description |
| category | string | - | Filter by category |
| status | string | - | AVAILABLE \| NOT_AVAILABLE |
| sortBy | string | - | e.g. createdAt, name |
| sortOrder | string | desc | asc \| desc |

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "products": [{ "id": 1, "name": "...", "category": "...", "price": "...", "image": "...", "status": "AVAILABLE", "createdAt": "...", "updatedAt": "..." }],
    "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
  }
}
```

### 6.5 Get product by ID (public)

**Request**

```http
GET /api/v1/products/:id
```

**Success response** `200` — single product object with full fields (including features, specifications, images).

---

## 7. Upload (files)

All upload routes require **admin token**. Used for general file storage (e.g. assets, documents). Product images are handled via product create/update.

### 7.1 Upload single file

**Request**

```http
POST /api/v1/upload/single
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | The file |
| type | string | No | Default `general` |
| folder | string | No | Default `general` |

**Success response** `201`

```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "filename": "1234-uuid.jpg",
    "url": "https://...",
    "size": 102400,
    "mimeType": "image/jpeg",
    "dimensions": { "width": 800, "height": 600 },
    "type": "general",
    "folder": "general",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 7.2 Upload multiple files

**Request**

```http
POST /api/v1/upload/multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form fields:** `files` (array, max 10), optional `type`, `folder`.

**Success response** `201`

```json
{
  "success": true,
  "data": [{ "id": "...", "filename": "...", "url": "...", ... }],
  "message": "5 files uploaded successfully"
}
```

### 7.3 Upload with named fields

**Request**

```http
POST /api/v1/upload/fields
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form fields:** `logo` (1), `favicon` (1), `heroImage` (1), `gallery` (up to 10), `documents` (up to 5).

**Success response** `201` — `data` is an object keyed by field name, each value is the file result object.

### 7.4 List uploads

**Request**

```http
GET /api/v1/upload
Authorization: Bearer <token>
```

**Success response** `200` — list of file records.

### 7.5 Get upload by ID

**Request**

```http
GET /api/v1/upload/:id
Authorization: Bearer <token>
```

**Success response** `200` — single file object.

### 7.6 Update upload metadata

**Request**

```http
PUT /api/v1/upload/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:** Fields to update (e.g. type, folder) as per backend schema.

### 7.7 Delete upload

**Request**

```http
DELETE /api/v1/upload/:id
Authorization: Bearer <token>
```

### 7.8 Upload stats

**Request**

```http
GET /api/v1/upload/stats/overview
Authorization: Bearer <token>
```

**Success response** `200` — stats object.

---

## 8. Orders (admin)

All order admin routes require **admin token**.

### 8.1 List all orders

**Request**

```http
GET /api/v1/orders/admin/all?page=1&limit=10&status=PENDING&paymentStatus=COMPLETED&search=ORD-123
Authorization: Bearer <token>
```

**Query**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page |
| limit | number | 10 | Per page (1–100) |
| search | string | - | Order number or user name/email |
| sortBy | string | - | Allowed sort field |
| sortOrder | string | desc | asc \| desc |
| status | string | - | PENDING \| CONFIRMED \| PROCESSING \| SHIPPED \| DELIVERED \| CANCELLED \| REFUNDED |
| paymentStatus | string | - | PENDING \| PROCESSING \| COMPLETED \| FAILED \| CANCELLED \| REFUNDED |

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "clxxx",
        "orderNumber": "ORD-1234567890-001",
        "status": "PENDING",
        "totalAmount": "599.98",
        "paymentStatus": "PENDING",
        "itemCount": 2,
        "paymentMethod": "stripe",
        "user": { "id": "...", "name": "...", "email": "..." },
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
  }
}
```

### 8.2 Update order status

**Request**

```http
PUT /api/v1/orders/admin/:id/status
Authorization: Bearer <token>
Content-Type: application/json
```

**Body**

```json
{
  "status": "CONFIRMED"
}
```

**Allowed status:** `PENDING` \| `CONFIRMED` \| `PROCESSING` \| `SHIPPED` \| `DELIVERED` \| `CANCELLED` \| `REFUNDED`.

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "orderNumber": "ORD-...",
    "status": "CONFIRMED",
    "totalAmount": "599.98",
    "paymentStatus": "PENDING",
    "items": [...],
    "shippingAddress": {...},
    "billingAddress": {...},
    "paymentMethod": "stripe",
    "notes": null,
    "user": { "id": "...", "name": "...", "email": "..." },
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "Order status updated successfully"
}
```

**Error responses:** 404 (ORDER_NOT_FOUND), 400 (VALIDATION_ERROR).

### 8.3 Order statistics

**Request**

```http
GET /api/v1/orders/admin/stats
Authorization: Bearer <token>
```

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "totalOrders": 100,
    "pendingOrders": 10,
    "completedOrders": 80,
    "totalRevenue": "45000.00"
  }
}
```

---

## 9. Payments (admin)

All payment admin routes require **admin token**.

### 9.1 List all payments

**Request**

```http
GET /api/v1/payments/admin/all?page=1&limit=10&status=COMPLETED
Authorization: Bearer <token>
```

**Query:** Same pagination/sort as orders; filters use payment fields (e.g. status).

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "clxxx",
        "orderId": "clxxx",
        "amount": "599.98",
        "currency": "USD",
        "paymentMethod": "stripe",
        "gateway": "stripe",
        "status": "COMPLETED",
        "transactionId": "ch_xxx",
        "metadata": null,
        "order": {
          "id": "clxxx",
          "orderNumber": "ORD-...",
          "totalAmount": "599.98",
          "status": "DELIVERED",
          "user": { "id": "...", "name": "...", "email": "..." }
        },
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 80, "totalPages": 8 }
  }
}
```

### 9.2 Update payment status

**Request**

```http
PUT /api/v1/payments/admin/:id/status
Authorization: Bearer <token>
Content-Type: application/json
```

**Body**

```json
{
  "status": "COMPLETED",
  "transactionId": "ch_xxx"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | New status |
| transactionId | string | No | Gateway reference |

**Success response** `200` — full payment object (including order, user).

**Error responses:** 400 (missing status), 404 (PAYMENT_NOT_FOUND).

### 9.3 Process refund

**Request**

```http
POST /api/v1/payments/admin/:id/refund
Authorization: Bearer <token>
Content-Type: application/json
```

**Body**

```json
{
  "refundAmount": 299.99,
  "reason": "Customer request"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|--------|
| refundAmount | number | Yes | > 0, cannot exceed payment amount |
| reason | string | No | Free text |

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "orderId": "clxxx",
    "amount": "-299.99",
    "currency": "USD",
    "paymentMethod": "stripe",
    "gateway": "stripe",
    "status": "COMPLETED",
    "transactionId": "REFUND-ch_xxx",
    "metadata": { "originalPaymentId": "...", "reason": "...", "refundAmount": 299.99 },
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "Refund processed successfully"
}
```

**Error responses:** 400 (VALIDATION_ERROR, INVALID_PAYMENT_STATUS, INVALID_REFUND_AMOUNT), 404 (PAYMENT_NOT_FOUND). Payment must be `COMPLETED` to refund.

### 9.4 Payment statistics

**Request**

```http
GET /api/v1/payments/admin/stats
Authorization: Bearer <token>
```

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "totalPayments": 80,
    "completedPayments": 75,
    "failedPayments": 3,
    "totalAmount": "45000.00"
  }
}
```

---

## 10. Cart (admin)

All cart admin routes require **admin token**. They operate on **any user’s cart** by `userId`.

### 10.1 List all carts

**Request**

```http
GET /api/v1/cart/admin/all?page=1&limit=10&search=john
Authorization: Bearer <token>
```

**Query**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page |
| limit | number | 10 | Per page |
| search | string | - | User name or email or product name |

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "carts": [
      {
        "id": "clxxx",
        "userId": "clxxx",
        "productId": 1,
        "quantity": 2,
        "user": { "id": "...", "name": "...", "email": "..." },
        "product": { "id": 1, "name": "...", "price": "299.99", "image": "...", "category": "..." },
        "itemTotal": 599.98,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
  }
}
```

### 10.2 Get cart by user ID

**Request**

```http
GET /api/v1/cart/admin/user/:userId
Authorization: Bearer <token>
```

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "userId": "clxxx",
    "user": { ... },
    "items": [
      {
        "id": "clxxx",
        "productId": 1,
        "quantity": 2,
        "product": { "id": 1, "name": "...", "price": "...", "image": "...", "category": "...", "description": "..." },
        "itemTotal": 599.98,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "total": 599.98,
    "itemCount": 1
  }
}
```

### 10.3 Update cart item quantity (admin)

**Request**

```http
PUT /api/v1/cart/admin/user/:userId/product/:productId
Authorization: Bearer <token>
Content-Type: application/json
```

**Body**

```json
{
  "quantity": 3
}
```

| Field | Type | Required | Rules |
|-------|------|----------|--------|
| quantity | number | Yes | Integer 1–100. If 0 or less, item is removed. |

**Success response** `200` — updated cart item or removal message.

### 10.4 Remove item from user cart

**Request**

```http
DELETE /api/v1/cart/admin/user/:userId/product/:productId
Authorization: Bearer <token>
```

**Success response** `200` — `{ "success": true, "data": { ... }, "message": "Item removed from cart successfully" }`.

### 10.5 Clear user cart

**Request**

```http
DELETE /api/v1/cart/admin/user/:userId/clear
Authorization: Bearer <token>
```

**Success response** `200` — `{ "success": true, "data": { ... }, "message": "Cart cleared successfully" }`.

### 10.6 Cart statistics

**Request**

```http
GET /api/v1/cart/admin/stats
Authorization: Bearer <token>
```

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "totalCarts": 50,
    "totalItems": 120,
    "totalValue": 35000.00,
    "averageItemsPerCart": 2.4,
    "averageCartValue": 700.00,
    "activeCarts": 45
  }
}
```

---

## 11. Enquiries

Enquiry **create** (from website) is **public**. **List, get by id, update status, respond, delete** require **admin token**.

### 11.1 List enquiries (admin)

**Request**

```http
GET /api/v1/enquiries?page=1&limit=10&status=NEW&priority=HIGH&search=john
Authorization: Bearer <token>
```

**Query**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page |
| limit | number | 10 | Per page (1–100) |
| search | string | - | customerName, email, subject, message |
| sortBy | string | createdAt | createdAt, updatedAt, customerName, email, status, priority, source |
| sortOrder | string | desc | asc \| desc |
| status | string | - | NEW \| IN_PROGRESS \| RESPONDED \| CLOSED |
| priority | string | - | HIGH \| MEDIUM \| LOW |

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "enquiries": [
      {
        "id": "clxxx",
        "customerName": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "product": "Solar Panel",
        "subject": "Pricing question",
        "message": "What is the price for...",
        "status": "NEW",
        "priority": "MEDIUM",
        "source": "Website Form",
        "location": null,
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z",
        "lastResponse": null
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 20, "totalPages": 2 }
  }
}
```

### 11.2 Get enquiry by ID

**Request**

```http
GET /api/v1/enquiries/:id
Authorization: Bearer <token>
```

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "customerName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "product": "Solar Panel",
    "subject": "Pricing question",
    "message": "What is the price for...",
    "status": "NEW",
    "priority": "MEDIUM",
    "source": "Website Form",
    "location": null,
    "createdAt": "...",
    "updatedAt": "...",
    "responses": [
      {
        "id": "clxxx",
        "enquiryId": "clxxx",
        "message": "Thank you for your enquiry...",
        "sentBy": "admin@greenbeam.com",
        "emailSent": true,
        "sentAt": "..."
      }
    ]
  }
}
```

**Error responses:** 404 (ENQUIRY_NOT_FOUND).

### 11.3 Update enquiry status

**Request**

```http
PATCH /api/v1/enquiries/:id/status
Authorization: Bearer <token>
Content-Type: application/json
```

**Body**

```json
{
  "status": "IN_PROGRESS"
}
```

**Allowed status:** `NEW` \| `IN_PROGRESS` \| `RESPONDED` \| `CLOSED`.

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "status": "IN_PROGRESS",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Error responses:** 404 (ENQUIRY_NOT_FOUND), 400 (VALIDATION_ERROR).

### 11.4 Respond to enquiry

**Request**

```http
POST /api/v1/enquiries/:id/respond
Authorization: Bearer <token>
Content-Type: application/json
```

**Body**

```json
{
  "message": "Thank you for your enquiry. We will get back to you with pricing shortly.",
  "sendEmail": true
}
```

| Field | Type | Required | Rules |
|-------|------|----------|--------|
| message | string | Yes | 10–2000 chars |
| sendEmail | boolean | No | Default true; send reply email to customer |

**Success response** `200`

```json
{
  "success": true,
  "data": {
    "enquiryId": "clxxx",
    "response": {
      "id": "clxxx",
      "message": "Thank you for your enquiry...",
      "sentBy": "admin@greenbeam.com",
      "sentAt": "2024-01-15T11:00:00.000Z",
      "emailSent": true
    }
  }
}
```

**Note:** `sentBy` is set from the admin user’s email (token), not from the body.

**Error responses:** 404 (ENQUIRY_NOT_FOUND), 400 (VALIDATION_ERROR).

### 11.5 Delete enquiry

**Request**

```http
DELETE /api/v1/enquiries/:id
Authorization: Bearer <token>
```

**Success response** `200` — `{ "success": true, "data": { ... } }`.

**Error responses:** 404 (ENQUIRY_NOT_FOUND).

---

## 12. Frontend integration examples

### 12.1 Base config and auth

```javascript
const API_BASE = 'https://api.greenbeam.online/api/v1';

function getAuthHeaders() {
  const token = localStorage.getItem('adminToken'); // or your store
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Login failed');
  localStorage.setItem('adminToken', json.data.token);
  return json.data;
}
```

### 12.2 Authenticated GET (e.g. dashboard stats)

```javascript
async function getDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Request failed');
  return json.data;
}
```

### 12.3 Authenticated POST with JSON (e.g. update order status)

```javascript
async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${API_BASE}/orders/admin/${orderId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Update failed');
  return json.data;
}
```

### 12.4 Create product (multipart)

```javascript
async function createProduct(formData) {
  const token = localStorage.getItem('adminToken');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  // Do NOT set Content-Type; browser sets multipart boundary
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers,
    body: formData, // FormData with name, category, price, description, status, image, images
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Create failed');
  return json.data;
}

// Example: build FormData
const fd = new FormData();
fd.append('name', 'Solar Panel');
fd.append('category', 'Solar');
fd.append('price', '299.99');
fd.append('status', 'AVAILABLE');
if (mainImageFile) fd.append('image', mainImageFile);
additionalFiles.forEach((file) => fd.append('images', file));
await createProduct(fd);
```

### 12.5 Paginated list with query (e.g. orders)

```javascript
async function getOrders(page = 1, limit = 10, filters = {}) {
  const params = new URLSearchParams({ page, limit, ...filters });
  const res = await fetch(`${API_BASE}/orders/admin/all?${params}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Request failed');
  return json.data;
}
```

### 12.6 Error handling

```javascript
async function apiCall(url, options = {}) {
  const res = await fetch(url, options);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      // Clear token, redirect to login
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
      return;
    }
    throw new Error(json.error?.message || `Request failed: ${res.status}`);
  }
  return json.success ? json.data : json;
}
```

---

## Implemented vs not mounted

| Area | Status | Notes |
|------|--------|--------|
| Auth (login, profile, etc.) | Implemented | Mounted at `/api/v1/auth` |
| Dashboard | Implemented | Mounted at `/api/v1/dashboard` |
| Settings | Implemented | Mounted at `/api/v1/settings` |
| Products | Implemented | Mounted at `/api/v1/products` |
| Upload | Implemented | Mounted at `/api/v1/upload` |
| Orders (admin) | Implemented | Mounted at `/api/v1/orders` |
| Payments (admin) | Implemented | Mounted at `/api/v1/payments` |
| Cart (admin) | Implemented | Mounted at `/api/v1/cart` |
| Enquiries | Implemented | Mounted at `/api/v1/enquiries` |
| Email (send, logs, stats, resend, test) | Not mounted | Routes exist in code but router not mounted in `server.js` |
| Notifications | Not mounted | Routes exist in code but router not mounted in `server.js` |

To use Email or Notifications from the admin panel, mount their routers in `server.js` and add the base paths to this doc.

---

## Enums quick reference

**Order status:** `PENDING` \| `CONFIRMED` \| `PROCESSING` \| `SHIPPED` \| `DELIVERED` \| `CANCELLED` \| `REFUNDED`  
**Payment status:** `PENDING` \| `PROCESSING` \| `COMPLETED` \| `FAILED` \| `CANCELLED` \| `REFUNDED`  
**Enquiry status:** `NEW` \| `IN_PROGRESS` \| `RESPONDED` \| `CLOSED`  
**Enquiry priority:** `HIGH` \| `MEDIUM` \| `LOW`  
**Product status:** `AVAILABLE` \| `NOT_AVAILABLE`  
**Payment method:** `stripe` \| `paypal` \| `bank_transfer`
