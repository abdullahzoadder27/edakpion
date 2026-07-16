import fs from 'fs';
let content = fs.readFileSync('src/pages/ProductDetail.tsx', 'utf-8');

if (!content.includes('import ProductReviews')) {
  content = content.replace(
    "import { Link, useParams } from 'react-router-dom';",
    "import { Link, useParams } from 'react-router-dom';\nimport ProductReviews from '../components/ProductReviews';"
  );
  
  content = content.replace(
    "import { ShoppingBag, Heart, Share2, Star, Shield, Truck, RefreshCw, CheckCircle2 } from 'lucide-react';",
    "import { ShoppingBag, Heart, Share2, Star, Shield, Truck, RefreshCw, CheckCircle2 } from 'lucide-react';"
  );
  
  // Find where to insert ProductReviews. Probably after the product details grid.
  const targetHtml = `</section>\n\n        {/* Related Products */}`;
  
  if (content.includes(targetHtml)) {
    content = content.replace(
      targetHtml,
      `</section>\n\n        {/* Product Reviews */}\n        <ProductReviews productId={product.id} productName={product.name} productImage={product.images?.[0]} />\n\n        {/* Related Products */}`
    );
  } else {
    // try another spot, like right before Related Products text
    const alternateTarget = `{/* Related Products */}`;
    if (content.includes(alternateTarget)) {
      content = content.replace(
        alternateTarget,
        `{/* Product Reviews */}\n        <ProductReviews productId={product.id} productName={product.name} productImage={product.images?.[0]} />\n\n        {/* Related Products */}`
      );
    }
  }

  fs.writeFileSync('src/pages/ProductDetail.tsx', content);
  console.log('Added ProductReviews to ProductDetail');
}
