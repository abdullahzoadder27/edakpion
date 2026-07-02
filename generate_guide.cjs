const fs = require('fs');
const path = require('path');

const guideContent = `# Complete Frontend to Supabase Backend Integration Guide

This guide provides a comprehensive, production-ready backend setup for **EDAKPION** using Supabase PostgreSQL, Auth, Storage, and Realtime. It maintains full compatibility with your existing frontend.

---

## 1. Setup Guide

This guide is meant to be executed step-by-step. All required SQL files are generated in the \`supabase/production_setup/\` folder.

### **Step 1.1: Authentication Configuration**
**Why:** To allow users to sign up, log in, and secure their data.
**Where:** Supabase Dashboard > Authentication > Providers
- Ensure **Email** is enabled.
- For testing, you may disable "Confirm email" (so you don't need a real email to log in).
- **Verify:** Try creating a dummy user in your frontend signup page.

### **Step 1.2: URL Configuration**
**Why:** So password reset links and Auth redirects go to your frontend.
**Where:** Authentication > URL Configuration
- Set **Site URL** to your deployment or local URL (e.g. \`http://localhost:3000\`).

### **Step 1.3: Run SQL Migrations**
**Why:** This creates the database schema, indexes, functions, triggers, and RLS policies.
**Where:** Supabase Dashboard > SQL Editor
**What to run:** Execute the files from \`supabase/production_setup/\` in strict numerical order (01 to 12).
- **Verify:** Check your Table Editor. You should see tables like \`products\`, \`profiles\`, \`carts\`, \`orders\`, etc.

### **Step 1.4: Assign Super Admin**
**Why:** One user needs to manage the store.
**Where:** SQL Editor
- First, sign up on the frontend.
- Go to Authentication > Users in Supabase, copy your User UUID.
- Open \`11_admin.sql\` (or type it in the SQL Editor) and run: \`INSERT INTO public.admins (id) VALUES ('YOUR-UUID');\`

### **Step 1.5: Enable Realtime**
**Why:** To get instant updates when a cart changes, an order is placed, or support messages arrive.
**Where:** The \`12_realtime.sql\` file handles this automatically by adding tables to the \`supabase_realtime\` publication.

---

## 2. SQL File Structure & Execution Order

All files are located in \`supabase/production_setup/\`:
1. \`01_extensions.sql\` (Extensions like uuid-ossp)
2. \`02_tables.sql\` (All required tables for the system)
3. \`03_indexes.sql\` (Performance optimization)
4. \`04_storage.sql\` (Bucket creation)
5. \`05_functions.sql\` (Automated functions like order numbering)
6. \`06_triggers.sql\` (Triggers for inventory, profile creation)
7. \`07_rls.sql\` (Row Level Security restricting user data)
8. \`08_storage_policies.sql\` (Rules for bucket access)
9. \`09_views.sql\` (Admin reporting views)
10. \`10_seed.sql\` (Initial website settings and delivery charges)
11. \`11_admin.sql\` (Single super admin creation)
12. \`12_realtime.sql\` (Enable WebSockets for specific tables)

---

## 3. Database Tables

Your schema covers 9 primary modules:
- **Authentication**: \`profiles\`, \`admins\`
- **Products**: \`brands\`, \`categories\`, \`collections\`, \`products\`, \`product_images\`, \`product_variants\`, \`inventory\`
- **Shopping**: \`carts\`, \`cart_items\`, \`wishlists\`, \`wishlist_items\`
- **Customers**: \`addresses\`, \`recently_viewed\`
- **Orders**: \`orders\`, \`order_items\`, \`payments\`, \`delivery_charges\`, \`order_status_history\`
- **Notifications**: \`notifications\`
- **CMS**: \`homepage_sections\`, \`banners\`, \`testimonials\`, \`settings\`, \`contact_messages\`, \`newsletter_subscribers\`
- **Fashion Journal**: \`fashion_categories\`, \`fashion_articles\`, \`fashion_article_images\`, \`fashion_article_products\`
- **Support Center**: \`support_conversations\`, \`support_messages\`, \`support_attachments\`, \`support_internal_notes\`
- **System**: \`audit_logs\`

---

## 4 & 5. Storage Buckets & Folder Structure

Buckets automatically created via \`04_storage.sql\`:

- **products** (Public): For product images. (e.g. \`/products/featured/\`, \`/products/gallery/\`)
- **categories** & **collections** (Public): Navigation thumbnails.
- **homepage** & **banners** (Public): CMS visual assets. (e.g. \`/homepage/hero/\`)
- **users** (Public): User avatars. (e.g. \`/users/{user_id}/\`)
- **logos** & **icons** (Public): Core branding assets.
- **fashion-journal** (Public): Blog imagery.
- **support** (Private): Sensitive attachments (receipts, issues). (e.g. \`/support/{conversation_id}/\`)
- **documents** (Private): Internal admin/company files.

### Storage Policies (08_storage_policies.sql)
- **Public Read**: Anyone can view products, banners, journal images.
- **Authenticated Upload**: Logged-in users can upload to \`users\` (avatars) and \`support\` (tickets).
- **Owner Control**: Users can only update/delete their *own* avatar or view their *own* support tickets.
- **Super Admin**: Has bypass access to all buckets for full control.

---

## 6. Row Level Security (RLS)

Strict boundaries established in \`07_rls.sql\`:
- **Guest**: Can browse active products, categories, collections, banners, and published journal articles.
- **Authenticated User**: Can securely query their own \`cart\`, \`wishlist\`, \`orders\`, \`addresses\`, \`notifications\`, and \`support_conversations\` using \`auth.uid() = user_id\`.
- **Single Super Admin**: A helper function \`is_super_admin()\` bypasses RLS on all tables, granting full backend control.

---

## 7. PostgreSQL Functions & Triggers

Generated in \`05_functions.sql\` and \`06_triggers.sql\`:
- \`create_profile()\`: Automatically fires on user signup to generate a profile and an empty cart/wishlist.
- \`generate_order_number()\`: Automatically assigns IDs like \`ORD-20260701-A1B2C3\` before order insertion.
- \`reduce_inventory()\`: Triggered when an order status changes to 'confirmed'. Reduces variant stock.
- \`notify_order_status()\`: Creates a user notification when an order ships.
- \`update_updated_at_column()\`: Keeps modification timestamps accurate.

---

## 8. Views & Indexes

Defined in \`03_indexes.sql\` and \`09_views.sql\`:
- **Views**: \`dashboard_summary\`, \`recent_orders\`, \`low_stock_products\` provide pre-aggregated data for the Admin Dashboard.
- **Indexes**: Applied to foreign keys (\`category_id\`, \`user_id\`) and lookups (\`slug\`, \`sku\`, \`order_number\`) ensuring the application remains blazing fast as the product catalog grows.

---

## 9. Seed Data & Super Admin

- **Seed (\`10_seed.sql\`)**: Inserts baseline settings (Currency, Email), initial delivery charges (Dhaka/Outside Dhaka), and placeholder CMS sections.
- **Admin**: The system restricts administrative rights strictly to users added to the \`admins\` table. Run \`11_admin.sql\` manually to appoint yourself.

---

## 10. Frontend Integration Guide

How your Vanilla JS/React components should query Supabase:

- **Homepage**: Fetch \`banners\`, \`homepage_sections\`, and \`products\` (where \`is_featured = true\`).
- **Shop / Product Details**: Fetch \`products\` joining with \`product_variants\` and \`product_images\`. Filter by \`category_id\` or \`slug\`.
- **Cart & Wishlist**: Directly insert to \`cart_items\` or \`wishlist_items\`. RLS handles security (they only affect the logged-in user's cart).
- **Checkout**: Insert a record into \`addresses\`, then insert into \`orders\`, followed by \`order_items\`. The DB trigger auto-generates the order number. Clear the cart manually after success.
- **User Dashboard**: Fetch \`orders\`, \`addresses\`, and \`recently_viewed\` where \`user_id\` matches the session.
- **Support Center**: Insert into \`support_conversations\`, then subscribe to \`support_messages\` using Supabase Realtime to achieve live chat.
- **Fashion Journal**: Query \`fashion_articles\` (where \`is_published = true\`).
- **Admin Dashboard**: Use \`is_super_admin()\` implicit permission to fetch from the \`dashboard_summary\` view and manage all tables.

---

## 11. Testing Guide

Execute this checklist before going to production:
- [ ] **Signup**: Does an entry appear in \`auth.users\`? Does the trigger auto-create a row in \`public.profiles\` and \`carts\`?
- [ ] **Login**: Can you log in successfully and receive a JWT session?
- [ ] **Storage**: Try uploading an avatar. Can a different user delete it? (They shouldn't).
- [ ] **Shopping Flow**: Add to cart -> Checkout -> Ensure an \`order_number\` is generated.
- [ ] **Admin**: Make yourself Super Admin. Can you read all orders? 
- [ ] **Inventory**: Change an order to 'confirmed' manually in Supabase. Does the \`inventory\` table stock count drop?
- [ ] **Realtime**: Keep the Support Center page open. Insert a message directly into Supabase. Does the UI update instantly?

---

## 12. Troubleshooting Guide

- **Error \`PGRST205\` (Table missing/permissions)**: Make sure the RLS policy permits your user's role to read it. If you're a guest, the policy must allow \`SELECT USING (true)\`.
- **"New row violates row-level security policy"**: You are trying to INSERT data with a \`user_id\` that is not yours. The policy enforces \`auth.uid() = user_id\`.
- **Storage Upload Failed (403 Forbidden)**: Your bucket policy is missing or you haven't passed the Auth token.
- **Realtime not firing**: Ensure you enabled the table in publication (e.g. \`ALTER PUBLICATION supabase_realtime ADD TABLE tablename;\`).
- **Cannot insert order items**: Ensure the parent \`orders\` row is successfully inserted first, as the foreign key constraint is strict.

---
End of Guide.
`;

fs.writeFileSync(path.join(process.cwd(), 'SUPABASE_INTEGRATION_GUIDE.md'), guideContent);
console.log('Successfully generated SUPABASE_INTEGRATION_GUIDE.md');
