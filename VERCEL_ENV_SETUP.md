# Vercel Environment Variables Setup

Your database is now set up! Here's what you need to add to Vercel:

## Environment Variables for Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add:

### 1. DATABASE_URL
```
postgresql://neondb_owner:npg_ofgQH0E9uMZJ@ep-autumn-cake-a4aizha4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Environment**: Select all (Production, Preview, Development)

### 2. JWT_SECRET
Use this generated secret for production:
```
xXFkxZW4ZWHMzPRJKA74DSE+6VwvwTrfbrX9RWWnPzI=
```

**To generate a new one (if needed):**
```bash
openssl rand -base64 32
```

**Environment**: Select all (Production, Preview, Development)

### 3. ADMIN_EMAIL
```
admin@foodmate.com
```

**Environment**: Select all (Production, Preview, Development)

### 4. NODE_ENV
```
production
```

**Environment**: Production only

### 5. CORS_ORIGIN (Optional)
If you have a custom domain, add it here. Otherwise, leave it blank and the app will automatically allow Vercel domains.

**Format**: `https://your-app.vercel.app,https://your-custom-domain.com`

**Environment**: Select all (Production, Preview, Development)

## Steps to Add in Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. For each variable above:
   - Click **"Add New"**
   - Enter the **Key** (e.g., `DATABASE_URL`)
   - Enter the **Value** (paste from above)
   - Select the **Environments** (Production, Preview, Development)
   - Click **"Save"**

## After Adding Environment Variables

1. **Redeploy your application** in Vercel:
   - Go to **Deployments** tab
   - Click the **"⋯"** menu on the latest deployment
   - Select **"Redeploy"**

2. **Verify the deployment** works:
   - Visit your Vercel deployment URL
   - Try to register/login
   - Browse the catalog (should show 118 items)
   - Test adding items to cart

## Demo Account

After seeding, you can login with:
- **Email**: `demo@foodmate.com`
- **Password**: `demo123`

## Database Status

✅ Migrations applied successfully
✅ Database seeded with:
   - 4 Categories (Fruit, Vegetable, Non-veg, Breads)
   - 118 Food items (from TheMealDB API)
   - 1 Demo user account

## Troubleshooting

### If the app doesn't connect to the database:

1. **Check environment variables are set**:
   - Go to Vercel → Settings → Environment Variables
   - Verify all variables are present

2. **Verify DATABASE_URL format**:
   - Make sure it includes `?sslmode=require&channel_binding=require`
   - The connection string should be exactly as shown above

3. **Check Vercel deployment logs**:
   - Go to Deployments → Click on deployment → View logs
   - Look for any database connection errors

4. **Test connection locally**:
   ```bash
   cd app/backend
   export DATABASE_URL='postgresql://neondb_owner:npg_ofgQH0E9uMZJ@ep-autumn-cake-a4aizha4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
   npx prisma studio
   ```
   This opens Prisma Studio at `http://localhost:5555` to verify the connection.

## Security Notes

⚠️ **Important**: 
- Never commit the JWT_SECRET or DATABASE_URL to Git
- The JWT_SECRET shown above is just an example - generate a new one for production
- Keep your database password secure
- The `.env` file should be in `.gitignore` (which it already is)

