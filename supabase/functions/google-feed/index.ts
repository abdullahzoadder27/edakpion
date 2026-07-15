import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

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

serve(async (req) => {
  // Only allow GET requests
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const domain = "edakpion.com";

    // Setup streaming response to handle large catalogs without blowing up memory
    const body = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        const header = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>EDAKPION Store</title>
    <link>https://${domain}</link>
    <description>Premium Clothing Store Google Merchant Feed</description>
`;
        controller.enqueue(encoder.encode(header));

        let page = 0;
        const pageSize = 500;
        let hasMore = true;

        while (hasMore) {
          const { data: products, error } = await supabase
            .from('products')
            .select('*, category:categories(name)')
            .eq('is_active', true)
            .range(page * pageSize, (page + 1) * pageSize - 1);

          if (error) {
            console.error('Error fetching products:', error);
            controller.enqueue(encoder.encode(`<!-- Error fetching products -->\n`));
            break;
          }

          if (!products || products.length === 0) {
            hasMore = false;
            break;
          }

          for (const product of products) {
            // Validate missing mandatory data
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
              .map((img: string) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
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
            const identifierExists = 'no'; // Custom products typically don't have GTIN

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

            controller.enqueue(encoder.encode(xmlItem));
          }

          if (products.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        }

        const footer = `  </channel>\n</rss>`;
        controller.enqueue(encoder.encode(footer));
        controller.close();
      }
    });

    return new Response(body, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // Cloudflare friendly cache control
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        "Access-Control-Allow-Origin": "*"
      },
    });

  } catch (error) {
    console.error('Server error:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
