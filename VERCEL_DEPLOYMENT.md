# Vercel Deployment Guide

This guide will help you deploy the FoodMate platform to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A PostgreSQL database (recommended: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
3. Vercel CLI (optional, for local testing): `npm i -g vercel`

## Deployment Steps

### 1. Set up PostgreSQL Database

1. Create a PostgreSQL database on your preferred provider
2. Get your database connection URL (format: `postgresql://user:password@host:port/database`)
3. Note: You'll need this for the `DATABASE_URL` environment variable

### 2. Prepare Your Repository

Ensure all changes are committed to your Git repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

### 3. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `app/frontend/dist`
   - **Install Command**: `npm run install:all`

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

### 4. Configure Environment Variables

In your Vercel project settings, add the following environment variables:

#### Required Environment Variables

```
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ADMIN_EMAIL=admin@foodmate.com
NODE_ENV=production
```

#### Optional Environment Variables

```
CORS_ORIGIN=https://your-domain.vercel.app,https://your-custom-domain.com
PORT=3000
```

**Important Notes:**

- Generate a strong `JWT_SECRET` (use a random string generator)
- Replace `DATABASE_URL` with your actual PostgreSQL connection string
- `CORS_ORIGIN` can include multiple domains separated by commas
- If you don't set `CORS_ORIGIN`, the app will automatically allow Vercel domains

### 5. Run Database Migrations

After deploying, you need to run Prisma migrations to set up your database schema:

```bash
# Option 1: Using Vercel CLI
vercel env pull .env.local
cd app/backend
npx prisma migrate deploy

# Option 2: Run migrations manually with your DATABASE_URL
DATABASE_URL="your-database-url" npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### 6. Seed the Database (Optional)

To populate your database with initial data:

```bash
cd app/backend
DATABASE_URL="your-database-url" npm run prisma:seed
```

### 7. Verify Deployment

1. Visit your Vercel deployment URL
2. Test the application:
   - Register a new account
   - Browse the catalog
   - Add items to cart
   - Place an order

## Project Structure for Vercel

```
/
├── api/                    # Vercel serverless functions
│   └── [...].ts           # Catch-all API handler
├── app/
│   ├── backend/           # Express backend
│   └── frontend/          # React frontend
├── vercel.json            # Vercel configuration
└── package.json           # Root package.json
```

## How It Works

1. **Frontend**: Built as a static site and served from `app/frontend/dist`
2. **Backend**: Express app converted to serverless function in `api/[...].ts`
3. **API Routes**: All `/api/*` requests are routed to the serverless function
4. **Database**: Prisma Client is generated during build, connects to your PostgreSQL database

## Troubleshooting

### Build Fails

- Check that all environment variables are set correctly
- Verify `DATABASE_URL` is accessible from Vercel's servers
- Check build logs in Vercel dashboard for specific errors

### API Routes Not Working

- Verify the `api/[...].ts` file exists
- Check that routes in Express app use `/api` prefix
- Review Vercel function logs for errors

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure your database allows connections from Vercel's IPs (most cloud providers do this automatically)
- Check if SSL is required in your connection string

### CORS Errors

- Verify `CORS_ORIGIN` includes your Vercel deployment URL
- The app automatically allows `*.vercel.app` domains if `VERCEL` env var is set

## Custom Domain Setup

1. In Vercel dashboard, go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update `CORS_ORIGIN` environment variable to include your custom domain
5. Redeploy if necessary

## Continuous Deployment

Vercel automatically deploys when you push to your Git repository:

- Pushes to `main` branch → Production deployment
- Pushes to other branches → Preview deployments

## Environment Variables for Different Environments

You can set different environment variables for:

- Production
- Preview (pull requests)
- Development (local)

Set these in Vercel dashboard under Project Settings → Environment Variables.

## Support

For issues specific to:

- Vercel: Check [Vercel Documentation](https://vercel.com/docs)
- Prisma: Check [Prisma Documentation](https://www.prisma.io/docs)
- This app: Check the main README.md
