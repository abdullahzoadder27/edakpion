const fs = require('fs');

const filepath = 'src/pages/admin/ReviewsManage.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const badString = `                    <button onClick={() => { setReplyingTo(review.id); setReplyText(review.admin_reply || ''); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Reply"
                    />
                    </button>><MessageCircle className="w-4 h-4" /></button>`;

const goodString = `
                    <button onClick={() => { setEditingReviewId(review.id); setEditReviewText(review.review_text); setEditRating(review.rating || 5); }} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setReplyingTo(review.id); setReplyText(review.admin_reply || ''); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Reply">
                      <MessageCircle className="w-4 h-4" />
                    </button>
`;

content = content.replace(badString, goodString);
fs.writeFileSync(filepath, content);
console.log('Fixed bad replacement');
