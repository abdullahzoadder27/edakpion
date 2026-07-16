const fs = require('fs');

const filepath = 'src/pages/admin/ReviewsManage.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Add edit states
if (!content.includes('editingReviewId')) {
  content = content.replace(
    "const [replyingTo, setReplyingTo] = useState<string | null>(null);",
    "const [replyingTo, setReplyingTo] = useState<string | null>(null);\n  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);\n  const [editReviewText, setEditReviewText] = useState('');\n  const [editRating, setEditRating] = useState(5);"
  );
}

// Add save edit function
const saveEditFunc = `
  const submitEdit = async (id: string) => {
    try {
      const { error } = await supabase.from('reviews').update({ review_text: editReviewText, rating: editRating }).eq('id', id);
      if (error) throw error;
      setEditingReviewId(null);
      fetchReviews();
    } catch (err: any) {
      alert(\`Error editing: \${err.message}\`);
    }
  };
`;
if (!content.includes('submitEdit = async')) {
  content = content.replace(
    "const submitReply = async",
    saveEditFunc + "\n  const submitReply = async"
  );
}

// Update UI to show edit form
const editUI = `
                    {editingReviewId === review.id ? (
                      <div className="mt-2 space-y-2">
                        <select value={editRating} onChange={e => setEditRating(Number(e.target.value))} className="border p-1 text-xs rounded">
                          <option value="5">5 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="3">3 Stars</option>
                          <option value="2">2 Stars</option>
                          <option value="1">1 Star</option>
                        </select>
                        <textarea value={editReviewText} onChange={e => setEditReviewText(e.target.value)} className="w-full border p-2 text-sm rounded" rows={3} />
                        <div className="flex gap-2">
                          <button onClick={() => submitEdit(review.id)} className="bg-[#0F3D2E] text-white px-3 py-1 text-xs rounded">Save Edit</button>
                          <button onClick={() => setEditingReviewId(null)} className="text-gray-500 text-xs">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 mt-2">{review.review_text}</p>
                    )}
`;

content = content.replace(
  '<p className="text-sm text-gray-700 mt-2">{review.review_text}</p>',
  editUI
);

// Add edit button
const editButton = `
                    <button onClick={() => { setEditingReviewId(review.id); setEditReviewText(review.review_text); setEditRating(review.rating || 5); }} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
`;
if (!content.includes('setEditingReviewId(review.id)')) {
  content = content.replace(
    'title="Reply"',
    'title="Reply"\n                    />\n                    </button>' // dummy replace to find location, wait, let's just insert it before Reply
  );
  
  // It's safer to just replace `<MessageCircle className="w-4 h-4" />` context
  content = content.replace(
    '<button onClick={() => { setReplyingTo(review.id); setReplyText(review.admin_reply || \'\'); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Reply">',
    editButton + '\n                    <button onClick={() => { setReplyingTo(review.id); setReplyText(review.admin_reply || \'\'); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Reply">'
  );
}

fs.writeFileSync(filepath, content);
console.log('Added edit capability to ReviewsManage');
