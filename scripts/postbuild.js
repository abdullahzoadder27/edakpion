import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '../dist');
const indexHtml = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtml)) {
  console.error('index.html not found in dist folder');
  process.exit(1);
}

const content = fs.readFileSync(indexHtml, 'utf-8');

// Also create 404.html for GitHub Pages
fs.writeFileSync(path.join(distDir, '404.html'), content);

// Define the static routes to generate folders for
const routes = [
  'login',
  'signup',
  'shop',
  'product',
  'cart',
  'checkout',
  'about',
  'our-story',
  'contact',
  'faq',
  'faqs',
  'privacy',
  'terms',
  'shipping',
  'returns',
  'size-guide',
  'account',
  'account/orders',
  'account/wishlist',
  'account/addresses',
  'account/reviews',
  'account/profile',
  'account/security',
  'blog',
  'admin',
  'admin/products',
  'admin/orders',
  'admin/users',
  'admin/blogs',
  'admin/settings'
];

routes.forEach(route => {
  const routeDir = path.join(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  fs.writeFileSync(path.join(routeDir, 'index.html'), content);
});

console.log('Successfully generated static route folders and 404.html');
