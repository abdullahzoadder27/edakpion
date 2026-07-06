const fs = require('fs');

function optimizeFile(filepath) {
  if (!fs.existsSync(filepath)) return;
  let code = fs.readFileSync(filepath, 'utf8');
  
  // Replace <img ... /> with <img loading="lazy" decoding="async" ... /> unless it's a hero image.
  // This is a naive approach, let's just do it manually with a regex that avoids already lazy loaded.
  
  // Only add loading="lazy" decoding="async" if not already present
  code = code.replace(/<img(?![^>]*loading=)([^>]+)>/g, '<img loading="lazy" decoding="async"$1>');
  
  fs.writeFileSync(filepath, code);
}

// We will do this for most files
const files = [
  'src/pages/admin/ProductsManage.tsx',
  'src/pages/admin/UsersManage.tsx',
  'src/pages/admin/TestimonialsManage.tsx',
  'src/pages/admin/OrderDetailAdmin.tsx',
  'src/pages/admin/AdminBlogForm.tsx',
  'src/pages/admin/AdminProductForm.tsx',
  'src/pages/user/UserProfile.tsx',
  'src/pages/user/UserOrderDetails.tsx',
  'src/pages/user/UserReviews.tsx',
  'src/pages/ProductDetail.tsx',
  'src/pages/Cart.tsx',
  'src/pages/BlogDetail.tsx',
  'src/pages/Checkout.tsx',
  'src/components/layout/SearchModal.tsx',
  'src/components/layout/MobileDrawer.tsx',
  'src/components/layout/UserLayout.tsx',
  'src/components/layout/AdminLayout.tsx',
  'src/components/ui/ProductCard.tsx',
  'src/components/ui/BlogCard.tsx'
];

files.forEach(optimizeFile);

// For Home.tsx, we want the first image (hero) to NOT be lazy loaded
let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');
homeCode = homeCode.replace(/<img(?![^>]*loading=)([^>]+)>/g, '<img loading="lazy" decoding="async"$1>');
// Revert the first one (hero image)
homeCode = homeCode.replace(/<img loading="lazy" decoding="async"/, '<img fetchpriority="high"');
fs.writeFileSync('src/pages/Home.tsx', homeCode);

