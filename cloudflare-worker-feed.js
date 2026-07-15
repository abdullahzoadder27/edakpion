export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Intercept requests for /google-feed.xml
    if (url.pathname === '/google-feed.xml') {
      if (request.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
      }

      // Required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY
      const supabaseUrl = env.SUPABASE_URL;
      const supabaseKey = env.SUPABASE_ANON_KEY;
      const BASE_URL = "https://edakpion.com";

      if (!supabaseUrl || !supabaseKey) {
        return new Response("Configuration Error: Missing Supabase credentials", { status: 500 });
      }

      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      // Generate feed asynchronously
      ctx.waitUntil((async () => {
        try {
          const header = `<?xml version="1.0" encoding="UTF-8"?>\n<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n  <channel>\n    <title>EDAKPION Store</title>\n    <link>${BASE_URL}</link>\n    <description>Premium Clothing Store Google Merchant Feed</description>\n`;
          
          await writer.write(encoder.encode(header));

          let page = 0;
          const pageSize = 500;
          let hasMore = true;
          let totalProducts = 0;

          while (hasMore) {
            const fetchUrl = `${supabaseUrl}/rest/v1/products?select=*,category:categories(name)&is_active=eq.true&limit=${pageSize}&offset=${page * pageSize}`;
            
            const response = await fetch(fetchUrl, {
              headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Content-Type": "application/json"
              }
            });

            if (!response.ok) {
              console.error("Supabase fetch failed", await response.text());
              await writer.write(encoder.encode(`    <!-- Error fetching products from Supabase -->\n`));
              break;
            }

            const products = await response.json();

            if (!products || products.length === 0) {
              hasMore = false;
              break;
            }

            for (const product of products) {
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
                  .map(img => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
                  .join('\n');
              }

              const availability = product.stock > 0 ? 'in_stock' : 'out_of_stock';
              const price = `${Number(product.compare_at_price || product.price).toFixed(2)} BDT`;
              const salePrice = product.compare_at_price ? `${Number(product.price).toFixed(2)} BDT` : '';
              
              const condition = 'new';
              const brand = 'EDAKPION';
              
              let categoryName = 'Clothing';
              if (Array.isArray(product.category) && product.category[0]?.name) {
                categoryName = product.category[0].name;
              } else if (product.category && !Array.isArray(product.category)) {
                categoryName = product.category.name || 'Clothing';
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

              await writer.write(encoder.encode(xmlItem));
            }

            if (products.length < pageSize) {
              hasMore = false;
            } else {
              page++;
            }
          }

          const footer = `  </channel>\n</rss>`;
          await writer.write(encoder.encode(footer));
        } catch (err) {
          console.error("Worker error:", err);
          await writer.write(encoder.encode(`<!-- Worker Error: ${escapeXml(err.message)} -->\n</channel>\n</rss>`));
        } finally {
          await writer.close();
        }
      })());

      return new Response(readable, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          // Cache at edge for 5 mins, allow stale while revalidating
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Pass through other requests (if bound to the same domain)
    return fetch(request);
  }
};

function escapeXml(unsafe) {
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
