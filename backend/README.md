# StockFlow Backend

Node.js + Express + MongoDB backend for StockFlow inventory management.

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install deps:
   - `cd backend`
   - `npm install`
3. Seed default admin (optional):
   - `npm run seed`
4. Start server:
   - `npm run dev`

## Default admin (from seed)

- Email: `admin@stockflow.com`
- Password: `admin123`

## Base URL

- `http://localhost:5000/api`

## Endpoints

- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/register` (admin only)
- `GET /auth/users` (admin only)
- `POST /auth/users` (admin only)
- `PUT /auth/users/:id/role` (admin only)
- `DELETE /auth/users/:id` (admin only)
- `GET/POST/PUT/DELETE /products`
- `GET/POST/PUT/DELETE /suppliers`
- `GET/POST /sales`
- `GET/POST/PUT /purchase-orders`
- `GET /dashboard/stats`

All endpoints except `register`, `login`, and `health` require:

- `Authorization: Bearer <jwt_token>`
