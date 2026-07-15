# Google Merchant Center XML Feed - Deployment Instructions

## The Internal Problem Identified
The reason `https://edakpion.com/google-feed.xml` returned a blank/404 page is because the production application is built as a static Single Page Application (SPA) and deployed to **GitHub Pages** (fronted by **Cloudflare**).

The Node.js/Express `server.ts` configuration is only used during local development and preview environments. When deployed to GitHub Pages, the backend Node.js code is not executed, meaning the `/google-feed.xml` route is never served.

## The Solution: Cloudflare Workers
To seamlessly intercept requests to `https://edakpion.com/google-feed.xml` without requiring a backend server or static generation, we have implemented a highly optimized **Cloudflare Worker**.

This worker intercepts the exact route at the edge, queries your Supabase database directly using the REST API (with pagination and streaming), and returns a dynamically generated, validated XML feed to Google Merchant Center.

### Step-by-Step Deployment

1. **Log into Cloudflare**
   Go to your Cloudflare Dashboard and select your domain (`edakpion.com`).

2. **Create a new Worker**
   - Navigate to **Workers & Pages** -> **Create application** -> **Create Worker**.
   - Name it `edakpion-google-feed`.
   - Click **Deploy** (we will edit the code in the next step).

3. **Paste the Worker Code**
   - Click **Edit Code**.
   - Copy the entire contents of the `cloudflare-worker.js` file from this project.
   - Paste it into the Cloudflare editor, replacing the default code.
   - Click **Save and deploy**.

4. **Add Environment Variables**
   - Go to the Worker's **Settings** -> **Variables**.
   - Under **Environment Variables**, add the following two variables (you can find these in your Supabase dashboard under Settings -> API):
     - `SUPABASE_URL` (e.g., `https://alpougdeizdmuwxdevgw.supabase.co`)
     - `SUPABASE_ANON_KEY` (Your `anon` / `public` key)
   - Click **Deploy** or **Save**.

5. **Set up the Route**
   - Go back to your website's main dashboard in Cloudflare (for `edakpion.com`).
   - Navigate to **Workers Routes** (under **Workers & Pages** in the left sidebar).
   - Click **Add route**.
   - Set the route to: `*edakpion.com/google-feed.xml`
   - Select the `edakpion-google-feed` worker you just created.
   - Click **Save**.

## Final Validation
Once deployed, open `https://edakpion.com/google-feed.xml` in your browser. 
You will see the fully dynamic, production-ready, validated RSS 2.0 XML feed that syncs in real-time with your Supabase database!
