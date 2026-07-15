export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Only intercept requests for /google-feed.xml
    if (url.pathname !== '/google-feed.xml') {
      return fetch(request); // Passthrough other requests
    }

    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;
    const domain = "edakpion.com";

    if (!supabaseUrl || !supabaseKey) {
      return new Response("Configuration Error", { status: 500 });
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Generate feed asynchronously
    ctx.waitUntil((async () => {
      try {
        const header = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>EDAKPION Store</title>
    <link>https://${domain}</link>
    <description>Premium Clothing Store Google Merchant Feed</description>\n`;
        
        await writer.write(encoder.encode(header));

        let page = 0;
        const pageSize = 500;
        let hasMore = true;

        while (hasMore) {
          // Supabase REST API URL to fetch products and category name
          // select=*,category:categories(name)&is_active=eq.true
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
            await writer.write(encoder.encode(`<!-- Error fetching products -->\n`));
            break;
          }

          const products = await response.json();

          if (!products || products.length === 0) {
            hasMore = false;
            break;
          }

          for (const product of products) {
            if (!product.images || product.images.length === 0 || product.price == null) {
              continue;
            }

            const id = escapeXml(product.id);
            const title = escapeXml(product.name);
            const description = escapeXml(product.description || product.name);
            const link = `https://${domain}/product/${product.slug}`;
            
            const mainImage = product.images[0];
            const imageLink = escapeXml(mainImage);
            
            const additionalImages = product.images.slice(1) || [];
            const additionalImageLinksXml = additionalImages
              .map(img => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
              .join('\n');

            const availability = product.stock > 0 ? 'in_stock' : 'out_of_stock';
            const price = `${Number(product.compare_at_price || product.price).toFixed(2)} BDT`;
            const salePrice = product.compare_at_price ? `${Number(product.price).toFixed(2)} BDT` : '';
            
            const condition = 'new';
            const brand = 'EDAKPION';
            
            const categoryName = Array.isArray(product.category) 
                ? product.category[0]?.name 
                : product.category?.name;
            const productType = escapeXml(categoryName || 'Clothing');
            const identifierExists = 'no';

            let xmlItem = `    <item>
      <g:id>${id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
${additionalImageLinksXml ? additionalImageLinksXml + '\n' : ''}      <g:condition>${condition}</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
${salePrice ? `      <g:sale_price>${salePrice}</g:sale_price>\n` : ''}      <g:brand>${brand}</g:brand>
      <g:product_type>${productType}</g:product_type>
      <g:identifier_exists>${identifierExists}</g:identifier_exists>
    </item>\n`;

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
      } finally {
        await writer.close();
      }
    })());

    return new Response(readable, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // Cache at edge for 5 mins, allow stale while revalidating
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
      }
    });
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
