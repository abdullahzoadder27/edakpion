const fs = require('fs');

const filepath = 'src/pages/admin/AdminProductReviews.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Add admin_reply to Review type
if (!content.includes('admin_reply?: string;')) {
  content = content.replace(
    'admin_note?: string;',
    'admin_note?: string;\n  admin_reply?: string;'
  );
}

// Add admin_reply to the form
const replyHTML = `
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Reply (Public)</label>
                <textarea
                  rows={3}
                  value={editingReview?.admin_reply || ''}
                  onChange={(e) => setEditingReview({...editingReview, admin_reply: e.target.value})}
                  className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-sm"
                  placeholder="Public reply to the customer..."
                />
              </div>
`;

if (!content.includes('Admin Reply (Public)')) {
  content = content.replace(
    '<div className="mb-6">\n                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (Private)</label>',
    replyHTML + '\n              <div className="mb-6">\n                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (Private)</label>'
  );
}

// Ensure the form also resets admin_reply when adding a new review
content = content.replace(
  'admin_note: \'\',',
  'admin_note: \'\', admin_reply: \'\','
);

// We need to check if there is an Add Review default state where we should add admin_reply
content = content.replace(
  `verified_buyer: true,`,
  `verified_buyer: true,\n                admin_reply: '',`
);

fs.writeFileSync(filepath, content);
console.log('Fixed AdminProductReviews.tsx');
