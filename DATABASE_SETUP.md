# Database Setup Guide for Vercel Deployment

This guide will help you set up a PostgreSQL database for your FoodMate application deployed on Vercel.

## Option 1: Neon (Recommended - Free Tier Available) 🌟

Neon is a serverless PostgreSQL platform with a generous free tier. It's perfect for this project.

### Step 1: Create a Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Click **"Sign Up"** (you can use GitHub, Google, or email)
3. Complete the sign-up process

### Step 2: Create a New Project

1. Once logged in, click **"Create Project"**
2. Fill in the project details:
   - **Project Name**: `foodmate` (or any name you prefer)
   - **Region**: Choose the closest region to your users (e.g., `US East` for US users)
   - **PostgreSQL Version**: `15` or `16` (both work)
3. Click **"Create Project"**

### Step 3: Get Your Connection String

1. After the project is created, you'll see the **Connection Details** panel
2. Look for the **Connection string** field
3. Copy the connection string - it will look like:
   ```
   postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **Important**: Make sure to copy the connection string with `?sslmode=require` at the end (required for Neon)

### Step 4: Set Up Database in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variables:

   **For Production:**
   ```
   DATABASE_URL = postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET = your-super-secret-jwt-key-minimum-32-characters-long
   ADMIN_EMAIL = admin@foodmate.com
   NODE_ENV = production
   ```

   **For Preview (optional, for pull request previews):**
   - You can use the same database or create a separate one
   - Set the same variables for "Preview" environment

4. Click **"Save"** for each variable

### Step 5: Run Database Migrations

After setting up the environment variables, you need to run Prisma migrations to create the database tables.

#### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project (if not already linked):
   ```bash
   vercel link
   ```

4. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

5. Run migrations:
   ```bash
   cd app/backend
   npx prisma migrate deploy
   ```

   This will create all the tables in your database.

#### Option B: Using Neon SQL Editor

1. Go to your Neon project dashboard
2. Click on **"SQL Editor"** in the sidebar
3. Copy the contents of `app/backend/prisma/migrations/20251106175224_init/migration.sql`
4. Paste it into the SQL Editor
5. Click **"Run"**

#### Option C: Using Prisma Migrate Directly

1. Install dependencies:
   ```bash
   cd app/backend
   npm install
   ```

2. Set your DATABASE_URL environment variable:
   ```bash
   export DATABASE_URL="postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Step 6: Seed the Database (Optional but Recommended)

To populate your database with initial data (categories, items, demo user):

```bash
cd app/backend
DATABASE_URL="your-connection-string" npm run prisma:seed
```

Or if you've set the environment variable:
```bash
cd app/backend
npm run prisma:seed
```

This will:
- Create categories (Fruit, Vegetable, Non-veg, Breads)
- Fetch real food items from TheMealDB API
- Create a demo user: `demo@foodmate.com` / `demo123`

### Step 7: Verify Database Connection

1. Go back to your Neon dashboard
2. Click on **"Tables"** in the sidebar
3. You should see tables like:
   - `User`
   - `Category`
   - `Item`
   - `Cart`
   - `Order`
   - etc.

4. Or use Prisma Studio:
   ```bash
   cd app/backend
   DATABASE_URL="your-connection-string" npx prisma studio
   ```
   This opens a web interface at `http://localhost:5555` to browse your database.

## Option 2: Supabase (Alternative)

Supabase is another excellent option with a free tier.

### Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub or email

### Step 2: Create a New Project

1. Click **"New Project"**
2. Fill in:
   - **Organization**: Create or select one
   - **Project Name**: `foodmate`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
3. Click **"Create new project"** (takes 1-2 minutes)

### Step 3: Get Connection String

1. Go to **Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **URI** tab
4. Copy the connection string - it will look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

### Step 4-7: Follow the same steps as Neon

Use the Supabase connection string in Vercel environment variables and run migrations as described above.

## Option 3: Railway (Alternative)

Railway is another good option with easy setup.

### Step 1: Create a Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Create a New Project

1. Click **"New Project"**
2. Select **"Provision PostgreSQL"**
3. Railway will create a PostgreSQL database automatically

### Step 3: Get Connection String

1. Click on the PostgreSQL service
2. Go to **"Variables"** tab
3. Copy the `DATABASE_URL` value

### Step 4-7: Follow the same steps as Neon

Use the Railway connection string in Vercel environment variables and run migrations.

## Generating a Strong JWT Secret

You need a secure JWT secret for production. Generate one using:

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

Copy the generated secret and use it as your `JWT_SECRET` in Vercel environment variables.

## Troubleshooting

### Connection Errors

**Issue**: "Connection refused" or "Connection timeout"
- **Solution**: Make sure your database allows connections from Vercel's IP addresses
- Neon/Supabase/Railway should allow this by default
- Check if you need to add Vercel IPs to an allowlist (usually not required)

### SSL Connection Errors

**Issue**: "SSL required" or SSL connection errors
- **Solution**: Make sure your connection string includes `?sslmode=require`
- Neon requires SSL: `...?sslmode=require`
- Supabase requires SSL: `...?sslmode=require`

### Migration Errors

**Issue**: Migrations fail to run
- **Solution**: 
  1. Make sure `DATABASE_URL` is set correctly in Vercel
  2. Verify the connection string works: Test it locally first
  3. Check if tables already exist (might need to reset database)

### Database Reset (If Needed)

If you need to start fresh:

```bash
cd app/backend
DATABASE_URL="your-connection-string" npx prisma migrate reset
```

**Warning**: This will delete all data! Only use in development or if you're okay losing data.

## Next Steps

After setting up your database:

1. ✅ Database created
2. ✅ Connection string added to Vercel
3. ✅ Migrations run (tables created)
4. ✅ Database seeded (optional)
5. ✅ Vercel deployment configured
6. 🚀 Your app should now work!

## Need Help?

- **Neon Support**: [docs.neon.tech](https://docs.neon.tech)
- **Supabase Support**: [supabase.com/docs](https://supabase.com/docs)
- **Railway Support**: [docs.railway.app](https://docs.railway.app)
- **Prisma Docs**: [prisma.io/docs](https://www.prisma.io/docs)

