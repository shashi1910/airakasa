# Quick Vercel Setup Guide

## Your Database is Ready! ✅

Your Neon database has been set up and seeded with:
- ✅ Database schema created (all tables)
- ✅ 118 food items loaded
- ✅ Demo user account created

## Add These Environment Variables to Vercel

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

### Required Variables:

1. **DATABASE_URL**
   ```
   postgresql://neondb_owner:npg_ofgQH0E9uMZJ@ep-autumn-cake-a4aizha4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
   **Environments**: Production, Preview, Development

2. **JWT_SECRET**
   ```
   xXFkxZW4ZWHMzPRJKA74DSE+6VwvwTrfbrX9RWWnPzI=
   ```
   **Environments**: Production, Preview, Development

3. **ADMIN_EMAIL**
   ```
   admin@foodmate.com
   ```
   **Environments**: Production, Preview, Development

4. **NODE_ENV**
   ```
   production
   ```
   **Environments**: Production only

### Optional Variables:

5. **CORS_ORIGIN** (Leave blank for auto-detection)
   - The app automatically allows Vercel domains if this is not set

## After Adding Variables

1. **Redeploy**: Go to Deployments → Click "⋯" → "Redeploy"
2. **Test**: Visit your Vercel URL and login with:
   - Email: `demo@foodmate.com`
   - Password: `demo123`

## Quick Test Commands

Test database connection locally:
```bash
cd app/backend
export DATABASE_URL='postgresql://neondb_owner:npg_ofgQH0E9uMZJ@ep-autumn-cake-a4aizha4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
npx prisma studio
```

View database in Neon Console:
- Go to your Neon project dashboard
- Click "SQL Editor" to run queries
- Example: `SELECT * FROM "Item" LIMIT 10;`

## Need Help?

See `VERCEL_ENV_SETUP.md` for detailed troubleshooting.

