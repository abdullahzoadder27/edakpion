import { supabase } from '../lib/supabase';
const demoProductsData = [
  { name: 'Oversized T-Shirt', price: 790.00, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600' },
  { name: 'Casual Shirt', price: 1390.00, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=600' },
  { name: 'Varsity Jacket', price: 2490.00, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600' },
  { name: 'Printed Shirt', price: 1190.00, imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600' },
  { name: 'Cargo Vest', price: 1890.00, imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600' },
  { name: 'Windbreaker', price: 1590.00, imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600' }
];

const fullDemoProducts = demoProductsData.map((p, index) => ({
  name: p.name,
  slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  description: `Experience premium quality with our ${p.name}. Designed for comfort and everyday wear.`,
  short_description: `Premium quality ${p.name}.`,
  sku: `EDK-${p.name.substring(0, 3).toUpperCase()}-00${index + 1}`,
  brand: 'EDAKPION',
  category_id: null,
  collection_id: null,
  price: p.price,
  compare_at_price: p.price + 200,
  stock_quantity: 50,
  status: 'active',
  is_featured: index < 2,
  is_new_arrival: index > 1 && index < 4,
  is_best_seller: index === 0 || index === 2,
  is_trending: index > 3,
  seo_title: `${p.name} | EDAKPION`,
  seo_description: `Buy ${p.name} at the best price from EDAKPION.`,
  originalImageUrl: p.imageUrl,
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['#000000', '#FFFFFF', '#4A5D23']
}));

export async function migrateDemoProducts() {
  console.log("Starting product migration...");
  try {
    // 1. Check if products already exist
    const { data: existing, error: checkError } = await supabase.from('products').select('id').limit(1);
    if (checkError) {
      console.error("Error checking products:", checkError);
      return false;
    }
    if (existing && existing.length > 0) {
      console.log("Products already exist, skipping migration.");
      return true;
    }

    // 2. Fetch categories (or create one)
    let { data: categories } = await supabase.from('categories').select('id').limit(1);
    let categoryId = categories?.[0]?.id;
    if (!categoryId) {
      const { data: newCat } = await supabase.from('categories').insert({
        name: 'Top Picks',
        slug: 'top-picks',
        is_active: true
      }).select('id').single();
      categoryId = newCat?.id;
    }

    // 3. Process each product
    for (const prod of fullDemoProducts) {
      console.log(`Migrating ${prod.name}...`);
      
      // Upload image
      let uploadedImageUrl = null;
      try {
        const response = await fetch(prod.originalImageUrl);
        const blob = await response.blob();
        const fileName = `demo-${Date.now()}-${prod.slug}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(`featured/${fileName}`, blob, { contentType: 'image/jpeg' });
          
        if (uploadError) {
          console.error(`Failed to upload image for ${prod.name}`, uploadError);
        } else if (uploadData) {
          const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(`featured/${fileName}`);
          uploadedImageUrl = publicUrlData.publicUrl;
        }
      } catch (imgErr) {
        console.error("Image upload failed:", imgErr);
      }

      // Insert product
      const { data: insertedProduct, error: insertError } = await supabase.from('products').insert({
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        short_description: prod.short_description,
        sku: prod.sku,
        brand: prod.brand,
        category_id: categoryId,
        price: prod.price,
        compare_at_price: prod.compare_at_price,
        stock_quantity: prod.stock_quantity,
        status: prod.status,
        is_featured: prod.is_featured,
        is_new_arrival: prod.is_new_arrival,
        is_best_seller: prod.is_best_seller,
        is_trending: prod.is_trending,
        seo_title: prod.seo_title,
        seo_description: prod.seo_description
      }).select('id').single();

      if (insertError) {
        console.error("Failed to insert product", insertError);
        continue;
      }
      
      const productId = insertedProduct.id;

      // Insert image
      if (uploadedImageUrl) {
        await supabase.from('product_images').insert({
          product_id: productId,
          image_url: uploadedImageUrl,
          is_primary: true,
          display_order: 0
        });
        
        // Add a second mock gallery image just to have it
        await supabase.from('product_images').insert({
          product_id: productId,
          image_url: uploadedImageUrl,
          is_primary: false,
          display_order: 1
        });
      }

      // Insert variants (Sizes & Colors)
      const variantsToInsert = [];
      for (const size of prod.sizes) {
        for (const color of prod.colors) {
          variantsToInsert.push({
            product_id: productId,
            sku: `${prod.sku}-${size}-${color.replace('#', '')}`,
            size: size,
            color: color,
            price: prod.price,
            stock_quantity: 10
          });
        }
      }
      if (variantsToInsert.length > 0) {
        await supabase.from('product_variants').insert(variantsToInsert);
      }
      
      console.log(`Successfully migrated ${prod.name}`);
    }
    
    console.log("Migration complete!");
    return true;
  } catch (err) {
    console.error("Migration threw an error:", err);
    return false;
  }
}
