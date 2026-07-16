const fs = require('fs');

const filepath = 'src/components/ProductReviews.tsx';
let content = fs.readFileSync(filepath, 'utf8');

if (!content.includes('admin_reply?: string;')) {
  content = content.replace(
    'helpful_count: number;',
    'helpful_count: number;\n  admin_reply?: string;'
  );
}

const replyUI = `
                      {review.admin_reply && (
                        <div className="mt-4 bg-gray-50 border border-gray-100 p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-[#0F3D2E] flex items-center justify-center text-white text-xs font-bold">
                              EDK
                            </div>
                            <span className="font-bold text-sm text-gray-900">EDAKPION Support</span>
                          </div>
                          <div className="text-gray-700 text-sm">
                            <ReactMarkdown>{review.admin_reply}</ReactMarkdown>
                          </div>
                        </div>
                      )}
`;

if (!content.includes('EDAKPION Support')) {
  content = content.replace(
    '<div className="text-gray-700 prose prose-sm max-w-none">\n                        <ReactMarkdown>{review.review_text}</ReactMarkdown>\n                      </div>',
    '<div className="text-gray-700 prose prose-sm max-w-none">\n                        <ReactMarkdown>{review.review_text}</ReactMarkdown>\n                      </div>' + replyUI
  );
}

fs.writeFileSync(filepath, content);
console.log('Fixed ProductReviews.tsx');
