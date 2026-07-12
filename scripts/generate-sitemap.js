import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// For local testing if dotenv is available, otherwise relies on GitHub Actions env vars
try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch (e) {
  // Ignore
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase credentials. Sitemap generation skipped.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generate() {
  console.log('Fetching data from Supabase...');
  const { data: products } = await supabase.from('products').select('slug, updated_at');
  const { data: blogs } = await supabase.from('blogs').select('slug, updated_at');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Static Pages
  xml += `\n  <url>\n    <loc>https://edakpion.com/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`;
  xml += `\n  <url>\n    <loc>https://edakpion.com/shop</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`;
  xml += `\n  <url>\n    <loc>https://edakpion.com/blog</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`;
  xml += `\n  <url>\n    <loc>https://edakpion.com/about</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>`;
  xml += `\n  <url>\n    <loc>https://edakpion.com/contact</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>`;

  // Dynamic Product Pages
  if (products) {
    products.forEach(p => {
      xml += `\n  <url>\n    <loc>https://edakpion.com/product/${p.slug}</loc>\n    <lastmod>${p.updated_at ? p.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>\n    <priority>0.8</priority>\n  </url>`;
    });
  }

  // Dynamic Blog Pages
  if (blogs) {
    blogs.forEach(b => {
      xml += `\n  <url>\n    <loc>https://edakpion.com/blog/${b.slug}</loc>\n    <lastmod>${b.updated_at ? b.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>\n    <priority>0.7</priority>\n  </url>`;
    });
  }

  xml += `\n</urlset>`;

  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
  console.log('Sitemap generated successfully at public/sitemap.xml');
}

generate();
