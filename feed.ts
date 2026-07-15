import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://alpougdeizdmuwxdevgw.supabase.co';
const rawAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscG91Z2RlaXpkbXV3eGRldmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjMxMDMsImV4cCI6MjA5ODgzOTEwM30.4TGlaLUAnCVFkp89V5X-SWeZ5bEksywLXnE5BnVNn_E';
const supabaseKey = rawAnonKey.split('.').length > 3 ? rawAnonKey.split('.').slice(0, 3).join('.') : rawAnonKey;

const supabase = createClient(supabaseUrl, supabaseKey);

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return String(unsafe).replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function getGoogleFeed(req: Request, res: Response) {
  try {
    const BASE_URL = 'https://edakpion.com';

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

    // Start streaming response
    res.write(`<?xml version="1.0" encoding="UTF-8"?>\n`);
    res.write(`<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`);
    res.write(`  <channel>\n`);
    res.write(`    <title>EDAKPION Store</title>\n`);
    res.write(`    <link>${BASE_URL}</link>\n`);
    res.write(`    <description>Premium Clothing Store Google Merchant Feed</description>\n`);

    let page = 0;
    const pageSize = 500;
    let hasMore = true;
    let totalProducts = 0;
    
    // Debug mode can be disabled completely by removing the query check if strictly needed
    let debugMode = req.query.debug === 'true'; 

    while (hasMore) {
      const { data: products, error } = await supabase
        .from('products')
        .select('*, category:categories(name)')
        .eq('is_active', true)
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error('Supabase fetch error:', error);
        res.write(`    <!-- Error fetching products: ${escapeXml(error.message)} -->\n`);
        break;
      }

      if (!products || products.length === 0) {
        hasMore = false;
        break;
      }

      for (const product of products) {
        // Validation: skip products without minimum required data
        if (!product.id || !product.name) continue;

        totalProducts++;

        const id = escapeXml(product.id);
        const title = escapeXml(product.name);
        const description = escapeXml(product.description || product.name);
        const link = `${BASE_URL}/product/${product.slug}`;
        
        let imageLink = '';
        let additionalImageLinksXml = '';
        
        if (product.images && product.images.length > 0) {
          imageLink = escapeXml(product.images[0]);
          const additionalImages = product.images.slice(1) || [];
          additionalImageLinksXml = additionalImages
            .map((img: string) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
            .join('\n');
        }

        const availability = product.stock > 0 ? 'in_stock' : 'out_of_stock';
        // Base price is compare_at_price if sale exists, otherwise price
        const price = `${Number(product.compare_at_price || product.price).toFixed(2)} BDT`;
        const salePrice = product.compare_at_price ? `${Number(product.price).toFixed(2)} BDT` : '';
        
        const condition = 'new';
        const brand = 'EDAKPION';
        
        let categoryName = 'Clothing';
        if (Array.isArray(product.category) && product.category[0]?.name) {
          categoryName = product.category[0].name;
        } else if (product.category && !Array.isArray(product.category)) {
          categoryName = (product.category as any).name || 'Clothing';
        }
        
        const productType = escapeXml(categoryName);
        const identifierExists = 'no'; 

        let xmlItem = `    <item>\n`;
        xmlItem += `      <g:id>${id}</g:id>\n`;
        xmlItem += `      <g:title>${title}</g:title>\n`;
        xmlItem += `      <g:description>${description}</g:description>\n`;
        xmlItem += `      <g:link>${link}</g:link>\n`;
        if (imageLink) xmlItem += `      <g:image_link>${imageLink}</g:image_link>\n`;
        if (additionalImageLinksXml) xmlItem += `${additionalImageLinksXml}\n`;
        xmlItem += `      <g:condition>${condition}</g:condition>\n`;
        xmlItem += `      <g:availability>${availability}</g:availability>\n`;
        xmlItem += `      <g:price>${price}</g:price>\n`;
        if (salePrice) xmlItem += `      <g:sale_price>${salePrice}</g:sale_price>\n`;
        xmlItem += `      <g:brand>${brand}</g:brand>\n`;
        xmlItem += `      <g:product_type>${productType}</g:product_type>\n`;
        xmlItem += `      <g:identifier_exists>${identifierExists}</g:identifier_exists>\n`;
        xmlItem += `    </item>\n`;

        res.write(xmlItem);
      }

      if (products.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }

    if (debugMode) {
      res.write(`    <!-- DEBUG INFO\n`);
      res.write(`    Total Products Processed: ${totalProducts}\n`);
      res.write(`    Status: SUCCESS\n`);
      res.write(`    -->\n`);
    }

    res.write(`  </channel>\n`);
    res.write(`</rss>`);
    res.end();

  } catch (error: any) {
    console.error('Server error generating feed:', error);
    if (!res.headersSent) {
      res.status(500).send('Internal Server Error');
    } else {
      res.write(`<!-- Internal Server Error occurred during generation: ${escapeXml(error.message)} -->\n</rss>`);
      res.end();
    }
  }
}
