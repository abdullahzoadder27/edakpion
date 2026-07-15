import { createClient } from '@supabase/supabase-js';

// Get env variables
import * as dotenv from 'dotenv';
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

function escapeCsv(unsafe: any): string {
  if (unsafe === undefined || unsafe === null) return '';
  const str = String(unsafe);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// In-memory cache
let feedCache: { xml: string, csv: string, timestamp: number } | null = null;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache

async function generateFeeds(domain: string) {
  const { data: products, error } = await supabase
    .from('products')
    .select(`*, category:categories(name)`)
    .eq('is_active', true);

  if (error) {
    throw new Error('Failed to fetch products from Supabase');
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>EDAKPION Store</title>
    <link>https://${domain}</link>
    <description>Premium Clothing Store Google Merchant Feed</description>
`;

  let csv = 'id,title,description,link,image_link,additional_image_link,availability,price,sale_price,condition,brand,product_type,identifier_exists\n';

  for (const product of (products || [])) {
    const id = escapeXml(product.id);
    const title = escapeXml(product.name);
    const description = escapeXml(product.description || product.name);
    const link = `https://${domain}/product/${product.slug}`;
    const mainImage = product.images?.[0] || '';
    const imageLink = escapeXml(mainImage);
    const additionalImages = product.images?.slice(1) || [];
    const additionalImageLinksXml = additionalImages.map(img => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join('\n');
    const additionalImagesCsv = additionalImages.join(',');
    
    // Automatically set stock
    const availability = product.stock > 0 ? 'in_stock' : 'out_of_stock';
    const price = `${Number(product.compare_at_price || product.price).toFixed(2)} BDT`;
    const salePrice = product.compare_at_price ? `${Number(product.price).toFixed(2)} BDT` : '';
    
    const condition = 'new';
    const brand = 'EDAKPION';
    const productType = escapeXml(product.category?.name || 'Clothing');
    const identifierExists = 'no'; // Assuming no GTIN/MPN for custom brand unless added later

    // XML Item
    xml += `    <item>
      <g:id>${id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
${additionalImageLinksXml ? additionalImageLinksXml : ''}
      <g:condition>${condition}</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
${salePrice ? `      <g:sale_price>${salePrice}</g:sale_price>` : ''}
      <g:brand>${brand}</g:brand>
      <g:product_type>${productType}</g:product_type>
      <g:identifier_exists>${identifierExists}</g:identifier_exists>
    </item>
`;

    // CSV Row
    csv += `${escapeCsv(product.id)},${escapeCsv(product.name)},${escapeCsv(product.description || product.name)},${escapeCsv(link)},${escapeCsv(mainImage)},${escapeCsv(additionalImagesCsv)},${escapeCsv(availability)},${escapeCsv(price)},${escapeCsv(salePrice)},${escapeCsv(condition)},${escapeCsv(brand)},${escapeCsv(product.category?.name || 'Clothing')},${escapeCsv(identifierExists)}\n`;
  }

  xml += `  </channel>
</rss>`;

  feedCache = { xml, csv, timestamp: Date.now() };
  return feedCache;
}

export function clearFeedCache(req: any, res: any) {
  feedCache = null;
  res.status(200).send({ message: 'Feed cache cleared' });
}

export async function getGoogleFeed(req: any, res: any, type: 'xml' | 'csv') {
  try {
    const host = req.get('host') || 'yourdomain.com';
    
    if (!feedCache || Date.now() - feedCache.timestamp > CACHE_TTL) {
      await generateFeeds(host);
    }
    
    if (type === 'xml') {
      res.set('Content-Type', 'application/xml; charset=utf-8');
      return res.send(feedCache!.xml);
    } else {
      res.set('Content-Type', 'text/csv; charset=utf-8');
      return res.send(feedCache!.csv);
    }
  } catch (error) {
    console.error('Error generating Google Merchant Feed:', error);
    res.status(500).send('Internal Server Error');
  }
}
