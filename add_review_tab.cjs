const fs = require('fs');
const filepath = 'src/pages/admin/AdminProductForm.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Add import
if (!content.includes('AdminProductReviews')) {
  content = content.replace(
    "import { AlertCircle, ArrowLeft, BarChart3, CheckCircle2, ChevronRight, FileText, GripVertical, ImageIcon, Loader2, Package, Plus, Save, Tag, Trash2, Truck, X } from 'lucide-react';",
    "import { AlertCircle, ArrowLeft, BarChart3, CheckCircle2, ChevronRight, FileText, GripVertical, ImageIcon, Loader2, Package, Plus, Save, Tag, Trash2, Truck, X, MessageSquare } from 'lucide-react';\nimport AdminProductReviews from './AdminProductReviews';"
  );
}

// 2. Add Tab
if (!content.includes("id: 'reviews'")) {
  content = content.replace(
    "{ id: 'seo', name: 'SEO & Labels', icon: Tag },",
    "{ id: 'seo', name: 'SEO & Labels', icon: Tag },\n    ...(id ? [{ id: 'reviews', name: 'Reviews', icon: MessageSquare }] : []),"
  );
}

// 3. Add Tab Content Panel
const reviewPanel = `
        {activeTab === 'reviews' && id && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <AdminProductReviews productId={id} />
          </div>
        )}
`;

if (!content.includes("activeTab === 'reviews'")) {
  content = content.replace(
    "</form>",
    "</form>\n" + reviewPanel
  );
}

fs.writeFileSync(filepath, content);
console.log('Added review tab');
