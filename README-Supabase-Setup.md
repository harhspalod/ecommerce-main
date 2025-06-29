# 🚀 Complete Supabase Setup Guide

## 📋 Step 1: Create Supabase Account & Project

1. **Go to Supabase**: Visit [https://supabase.com](https://supabase.com)
2. **Sign Up**: Create a free account
3. **Create New Project**: 
   - Click "New Project"
   - Choose your organization
   - Enter project name: `ecommerce-crm`
   - Enter database password (save this!)
   - Select region closest to you
   - Click "Create new project"

## 🔑 Step 2: Get Your Credentials

After project creation (takes ~2 minutes):

1. **Go to Settings**: Click the gear icon in sidebar
2. **API Settings**: Click "API" in settings menu
3. **Copy Credentials**:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 📝 Step 3: Configure Environment Variables

Create `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace with your actual values from Step 2!**

## 🗄️ Step 4: Set Up Database

1. **Go to SQL Editor**: Click "SQL Editor" in Supabase dashboard
2. **Run Migration**: Copy and paste the migration SQL (already provided in project)
3. **Execute**: Click "Run" to create all tables and sample data

## ✅ Step 5: Verify Setup

1. **Check Tables**: Go to "Table Editor" in Supabase dashboard
2. **Verify Data**: You should see:
   - `customers` table with 5 sample customers
   - `products` table with 5 sample products
   - `purchases` table with purchase history
   - `campaigns` table with sample campaigns
   - `call_triggers` table (empty initially)

## 🎯 Step 6: Test the System

1. **Start Development Server**: `npm run dev`
2. **Open Dashboard**: Go to `http://localhost:3000`
3. **Test Features**:
   - View products (should load from database)
   - View customers (should show purchase history)
   - Create campaigns (should connect to products)
   - Trigger calls (should generate complete JSON data)

## 🔧 Troubleshooting

### Common Issues:

**1. "Failed to load products"**
- Check your `.env.local` file
- Verify Supabase URL and key are correct
- Make sure migration was run successfully

**2. "Database connection error"**
- Ensure your Supabase project is active
- Check if you're using the correct project URL
- Verify the anon key is copied completely

**3. "No data showing"**
- Run the migration SQL in Supabase SQL Editor
- Check Table Editor to see if sample data exists
- Refresh the page after running migration

### Getting Help:

1. **Check Console**: Open browser dev tools for error messages
2. **Supabase Logs**: Check "Logs" section in Supabase dashboard
3. **Network Tab**: Check if API calls are being made correctly

## 🚀 You're Ready!

Once setup is complete, you'll have:
- ✅ Complete database with sample data
- ✅ Real-time product and customer management
- ✅ Product-connected campaigns
- ✅ Complete call triggering system
- ✅ JSON data packages for external integration

The system will now work with real database data instead of mock data!