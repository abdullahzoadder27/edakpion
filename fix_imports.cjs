const fs = require('fs');

const filepath = 'src/pages/admin/AdminProductForm.tsx';
let content = fs.readFileSync(filepath, 'utf8');

if (!content.includes('MessageSquare')) {
  content = content.replace(
    'Image as ImageIcon, FileText, Settings, BarChart3, Truck',
    'Image as ImageIcon, FileText, Settings, BarChart3, Truck, MessageSquare'
  );
}

if (!content.includes('AdminProductReviews')) {
  content = content.replace(
    "import { Category, Product } from '../../types';",
    "import { Category, Product } from '../../types';\nimport AdminProductReviews from './AdminProductReviews';"
  );
}

fs.writeFileSync(filepath, content);
console.log('Fixed imports');
