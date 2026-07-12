#!/bin/bash

echo "Starting Next.js Migration Scaffold..."
echo "This script will create a Next.js folder structure ready for your components."

PROJECT_DIR="nextjs-edakpion"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# 1. Initialize Next.js project
echo "Installing Next.js..."
npx create-next-app@latest . --typescript --tailwind --eslint --app --use-npm --yes

# 2. Configure Next.js for Static Export
echo "Configuring Next.js for Static Export (output: export)..."
cat << 'EOF' > next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export with next/image
  },
};

export default nextConfig;
EOF

# 3. Create Automated Dynamic Sitemap Script
echo "Creating dynamic sitemap script..."
mkdir -p scripts
cat << 'EOF' > scripts/generate-sitemap.mjs
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase credentials. Skipping sitemap generation.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generate() {
  const { data: products } = await supabase.from('products').select('slug, updated_at');
  const { data: blogs } = await supabase.from('blogs').select('slug, updated_at');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  
  // Base URLs
  xml += `\n  <url>\n    <loc>https://edakpion.com/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`;
  xml += `\n  <url>\n    <loc>https://edakpion.com/shop</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`;
  
  if (products) {
    products.forEach(p => {
      xml += `\n  <url>\n    <loc>https://edakpion.com/product/${p.slug}</loc>\n    <lastmod>${p.updated_at ? p.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>\n    <priority>0.8</priority>\n  </url>`;
    });
  }
  
  if (blogs) {
    blogs.forEach(b => {
      xml += `\n  <url>\n    <loc>https://edakpion.com/blog/${b.slug}</loc>\n    <lastmod>${b.updated_at ? b.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>\n    <priority>0.7</priority>\n  </url>`;
    });
  }
  
  xml += `\n</urlset>`;
  
  fs.writeFileSync('public/sitemap.xml', xml);
  console.log('Sitemap generated successfully at public/sitemap.xml');
}

generate();
EOF

# 4. GitHub Actions YAML for Automated Deployment & Sitemap
echo "Creating GitHub Actions workflow..."
mkdir -p .github/workflows
cat << 'EOF' > .github/workflows/nextjs.yml
name: Deploy Next.js site to Pages

on:
  push:
    branches: ["main"]
  schedule:
    - cron: '0 0 * * *' # Run daily at midnight to update sitemap automatically
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Generate Sitemap
        run: node scripts/generate-sitemap.mjs
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      - name: Build with Next.js
        run: npx next build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
EOF

# 5. Image Alt Text Logic (React Component)
echo "Creating Image component with automated SEO alt text..."
mkdir -p src/components/ui
cat << 'EOF' > src/components/ui/SeoImage.tsx
import Image from 'next/image';

interface SeoImageProps {
  src: string;
  title: string; // The product or blog title from Supabase
  className?: string;
  priority?: boolean;
}

export function SeoImage({ src, title, className, priority = false }: SeoImageProps) {
  // Automatically generates a descriptive, SEO-friendly alt tag for the Streetwear niche
  const altText = `${title} - Premium Streetwear Bangladesh | Edakpion`;
  
  return (
    <Image 
      src={src} 
      alt={altText} 
      width={800} 
      height={800} 
      className={className}
      priority={priority}
    />
  );
}
EOF

# 6. Static Pre-rendered Product Page (SSG) with JSON-LD Schema & Meta
echo "Creating static dynamic route for Product pages..."
mkdir -p src/app/product/[slug]
cat << 'EOF' > src/app/product/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { SeoImage } from '@/components/ui/SeoImage';
// import ProductClient from './ProductClient'; // Your interactive client components

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. Static Generation at Build Time (fetch all slugs)
export async function generateStaticParams() {
  const { data: products } = await supabase.from('products').select('slug');
  return products?.map((product) => ({ slug: product.slug })) || [];
}

// 2. SEO-Optimized Static Metadata
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: product } = await supabase.from('products').select('*').eq('slug', params.slug).single();
  
  if (!product) return { title: 'Product Not Found' };
  
  return {
    title: `${product.name} | Premium Streetwear Bangladesh`,
    description: product.description?.substring(0, 150) || `Buy ${product.name} at Edakpion, the best premium streetwear brand in Bangladesh.`,
    alternates: {
      canonical: `https://edakpion.com/product/${params.slug}`
    },
    openGraph: {
      title: `${product.name} | Edakpion Streetwear`,
      description: product.description?.substring(0, 150),
      images: [product.images[0]],
    }
  };
}

// 3. Page Component with Static JSON-LD Product Schema
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { data: product } = await supabase.from('products').select('*').eq('slug', params.slug).single();

  if (!product) notFound();

  // Static JSON-LD Product Schema
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "Edakpion"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://edakpion.com/product/${product.slug}`,
      "priceCurrency": "BDT",
      "price": product.price,
      "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Edakpion"
      }
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* Inject Structured Data */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
           {/* Reusable Image Component with automatic SEO alt logic */}
           <SeoImage src={product.images[0]} title={product.name} className="w-full h-auto rounded-3xl" priority={true} />
        </div>
        <div>
          <h1 className="text-4xl font-serif mb-4">{product.name}</h1>
          <p className="text-2xl font-medium mb-6">৳{product.price}</p>
          <div className="prose mb-8">
            <p>{product.description}</p>
          </div>
          {/* Include your interactive React components (Add to Cart, Variants, etc) here */}
          {/* <ProductClient product={product} /> */}
        </div>
      </div>
    </main>
  );
}
EOF

echo "Done! The Next.js migration structure has been created locally in ./nextjs-edakpion"
echo "To migrate:"
echo "1. cd nextjs-edakpion"
echo "2. Copy your React components into src/components"
echo "3. Update import paths and run 'npm run dev' to test"
