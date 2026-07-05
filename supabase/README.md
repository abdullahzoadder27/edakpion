# EDAKPION Supabase Backend

This directory contains the database schema, RLS policies, storage policies, and seed data for the EDAKPION full-stack eCommerce application.

## Prerequisites
1. Create a [Supabase](https://supabase.com) account and project.
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) or use the Supabase SQL Editor.

## Setup Instructions

### 1. Database Migrations
Run the SQL migration scripts in the Supabase SQL Editor in the following order:
1. `migrations/001_initial_schema.sql`: Creates all tables, functions, and triggers.
2. `migrations/002_rls_policies.sql`: Enables RLS and sets up security policies.
3. `migrations/003_storage_policies.sql`: Creates storage buckets and their security policies.

### 2. Seed Data
After setting up the schema and policies, run the `seed.sql` file in the SQL Editor to populate the database with initial categories, products, blogs, testimonials, site content, and store settings.

### 3. Creating an Admin User
1. Sign up on the frontend or create a user in the Supabase Authentication dashboard.
2. Go to the Table Editor, open the `profiles` table.
3. Find your user record and change the `role` column value from `user` to `admin`.

### 4. Connect with your App
Add your Supabase credentials to your `.env` file:
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Security Notes
- Row Level Security (RLS) is enabled on all tables.
- Public users can only read active and published content.
- Authenticated users can only read/write their own data (orders, carts, wishlists, reviews, etc.).
- Only users with the `admin` role can access or modify admin data.
- The `is_admin()` helper function is used securely in RLS policies.
- File uploads are restricted by user authentication and bucket configurations.
