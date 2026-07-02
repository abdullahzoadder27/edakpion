const fs = require('fs');
let content = fs.readFileSync('src/hooks/useProducts.ts', 'utf8');

if (!content.includes('import { migrateDemoProducts }')) {
  content = content.replace(
    "import { Product } from '../types';",
    "import { Product } from '../types';\nimport { migrateDemoProducts } from '../utils/migrateProducts';"
  );
}

const originalFormat = `        if (data) {
          const formattedProducts: Product[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
            category: item.category_id || 'Top Picks'
          }));
          
          setProducts(formattedProducts);
        }`;

const autoFormat = `        if (data) {
          if (data.length === 0 && !activeTab) {
             // Auto migrate
             const success = await migrateDemoProducts();
             if (success) {
               const { data: retryData } = await query;
               if (retryData) {
                  data = retryData;
               }
             }
          }
          const formattedProducts: Product[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
            category: item.category_id || 'Top Picks'
          }));
          
          setProducts(formattedProducts);
        }`;

content = content.replace(originalFormat, autoFormat);
fs.writeFileSync('src/hooks/useProducts.ts', content);
