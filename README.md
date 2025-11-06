# FoodMate - Food Ordering Platform

A minimal-yet-complete food ordering platform built with React, Node.js, Express, and PostgreSQL. This MVP focuses on correctness, clean structure, and meeting core requirements without over-engineering.

## Overview

**Problem**: Build a functional food ordering platform that handles user authentication, catalog browsing, server-side cart management, transactional checkout with stock integrity, and order history.

**Solution**: A full-stack application with:
- **Frontend**: React + Vite with React Router, React Query, and Tailwind CSS
- **Backend**: Node.js + Express with Prisma ORM and PostgreSQL
- **Key Features**: JWT authentication, server-side cart merging, transactional stock checks, order management

## Tech Stack

- **Frontend**: React 18, Vite, React Router, React Query, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT with httpOnly cookies, bcrypt for password hashing
- **Validation**: Zod for schema validation
- **Security**: Rate limiting, input validation, CORS configuration

## How to Run (Local)

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or use Docker Compose)
- npm or yarn

### Step 1: Clone and Install

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd app/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Setup Environment Variables

**Backend** (`app/backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/foodmate?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
ADMIN_EMAIL="admin@foodmate.com"
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
PORT=3000
```

**Frontend** (`app/frontend/.env`):
```env
VITE_API_URL=http://localhost:3000
```

### Step 3: Database Setup

```bash
cd app/backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed
```

### Step 4: Start Development Servers

**Option A: Run both from root**
```bash
# From project root
npm run dev:all
```

**Option B: Run separately**
```bash
# Terminal 1 - Backend
cd app/backend
npm run dev

# Terminal 2 - Frontend
cd app/frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Docker One-liner

```bash
docker-compose up
```

This will start:
- PostgreSQL on port 5432
- Backend on port 3000
- Frontend on port 5173

**Note**: For Docker, you'll still need to run migrations and seed:
```bash
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed
```

## Seed Users

The seed script creates a demo user:
- **Email**: `demo@foodmate.com`
- **Password**: `demo123`

**Note**: The seed script automatically fetches real food items from [TheMealDB API](https://www.themealdb.com/) (free, no API key required) to populate the menu with authentic dishes, descriptions, and images. This provides a realistic food catalog with items from various cuisines.

You can register new users through the registration page.

## Test Plan

### Manual Test Steps

#### 1. Cart Merge Test (Multi-Device)
1. Register/login on Device A
2. Add items to cart (e.g., 2 Apples, 1 Banana)
3. Open the app on Device B (same account)
4. Verify cart shows the same items
5. Add 1 more Apple on Device B
6. Refresh Device A - should show 3 Apples total (merged)

#### 2. Out-of-Stock Test
1. Add an item with low stock (e.g., 2 items) to cart with quantity 2
2. In another session, try to add 3 of the same item
3. Attempt checkout - should fail with "NOT_AVAILABLE" for insufficient stock

#### 3. Concurrent Checkout Test
1. Add 5 items of a product with stock=5 to cart
2. Open two browser sessions (same user)
3. Attempt checkout simultaneously in both
4. One should succeed, the other should fail with stock issues

#### 4. Order History
1. Complete a checkout
2. Navigate to Orders page
3. Verify order appears with correct items and total
4. Click order to see details modal

#### 5. Category Filter & Search
1. Browse catalog
2. Filter by category (Fruit, Vegetable, etc.)
3. Use search to find items by name
4. Verify results update correctly

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Catalog
- `GET /api/categories` - List all categories
- `GET /api/items?categoryId=&q=&page=&limit=` - List items with filters
- `GET /api/items/:id` - Get item details

### Cart (Auth Required)
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PATCH /api/cart/items/:itemId` - Update item quantity
- `DELETE /api/cart/items/:itemId` - Remove item from cart

### Checkout (Auth Required)
- `POST /api/checkout` - Process checkout (transactional stock check)

### Orders (Auth Required)
- `GET /api/orders` - List user's orders
- `GET /api/orders/:id` - Get order details

### Admin (Auth Required + Admin Email)
- `POST /api/admin/orders/:id/deliver` - Mark order as delivered
- `POST /api/admin/items/:id/restock` - Restock item

See `docs/api_collection.json` for Postman/Insomnia collection.

## Deployment Notes

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Set build command: `cd app/frontend && npm run build`
3. Set output directory: `app/frontend/dist`
4. Add environment variable:
   - `VITE_API_URL`: Your backend API URL

### Backend + Database (Render/Railway)

#### Option 1: Render

1. Create new Web Service
2. Connect GitHub repository
3. Build command: `cd app/backend && npm install && npm run build`
4. Start command: `cd app/backend && npm start`
5. Add PostgreSQL database (Render provides managed Postgres)
6. Environment variables:
   - `DATABASE_URL`: From Render Postgres connection string
   - `JWT_SECRET`: Generate a strong secret
   - `ADMIN_EMAIL`: Your admin email
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://your-app.vercel.app`)
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render default)

7. Run migrations:
   ```bash
   cd app/backend
   npm run prisma:migrate deploy
   npm run prisma:seed
   ```

#### Option 2: Railway

1. Create new project, add PostgreSQL service
2. Add Node.js service, connect GitHub
3. Set root directory: `app/backend`
4. Environment variables (same as Render)
5. Railway auto-detects build/start commands

### Environment Variables Summary

**Backend (Production)**:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong random secret
- `ADMIN_EMAIL` - Admin user email
- `CORS_ORIGIN` - Frontend URL
- `NODE_ENV` - `production`
- `PORT` - Port number (varies by platform)

**Frontend (Production)**:
- `VITE_API_URL` - Backend API URL

## Project Structure

```
/app
  /frontend
    src/
      pages/ (Catalog, Cart, Orders, Auth)
      components/ (Layout, ProtectedRoute)
      api/ (typed fetchers with React Query)
      state/ (auth context)
    .env.example
  /backend
    src/
      index.ts
      routes/ (auth, items, cart, checkout, orders, admin)
      middleware/ (auth, errors, rateLimit)
      services/ (cartService, checkoutService, orderService)
      utils/ (prisma, validation)
    prisma/
      schema.prisma
      seed.ts
    .env.example
docker-compose.yml
README.md
```

## Concurrency & Stock Integrity

The checkout process uses PostgreSQL transactions with row-level locking (`SELECT ... FOR UPDATE`) to ensure:

1. Stock is checked atomically within a transaction
2. If any item has insufficient stock, the entire transaction is rolled back
3. Only successful checkouts deduct stock
4. Concurrent checkouts are handled correctly (last-write-wins for stock)

## Nice-to-Haves if Given More Time

- **Payments**: Integrate Stripe/Razorpay for actual payment processing
- **Addresses**: User address management for delivery
- **Coupons**: Discount codes and promotional offers
- **Inventory Reservations**: Reserve stock for X minutes during checkout
- **Admin Dashboard**: Full admin UI for managing items, orders, inventory
- **Pagination & Caching**: Server-side pagination, Redis caching for catalog
- **E2E Tests**: Playwright/Cypress tests for critical flows
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Real-time Updates**: WebSocket for order status updates
- **Email Notifications**: Order confirmation and delivery emails
- **Image Upload**: Allow admins to upload item images
- **Reviews & Ratings**: Customer feedback system

## Quality Bar

- ✅ Lint passes (ESLint/Prettier configured)
- ✅ TypeScript strict mode enabled
- ✅ Clear error messages in UI
- ✅ Loading and empty states handled
- ✅ No silent failures
- ✅ Input validation on both client and server
- ✅ Rate limiting on sensitive endpoints
- ✅ Password hashing with bcrypt
- ✅ JWT authentication with httpOnly cookies

## License

MIT

## Support

For issues or questions, please open an issue on the repository.
