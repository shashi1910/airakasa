# Quick Start Guide

## Prerequisites
- Node.js 20+
- PostgreSQL 15+ (or Docker)

## Setup (5 minutes)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Setup Backend Environment
```bash
cd app/backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
```

### 3. Setup Frontend Environment
```bash
cd ../frontend
cp .env.example .env
# VITE_API_URL should be http://localhost:3000
```

### 4. Initialize Database
```bash
cd ../backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 5. Start Development
```bash
# From project root
npm run dev:all
```

Or separately:
```bash
# Terminal 1
cd app/backend && npm run dev

# Terminal 2
cd app/frontend && npm run dev
```

## Access
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Demo User: demo@foodmate.com / demo123

## Docker Alternative
```bash
docker-compose up
# Then run migrations:
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed
```
