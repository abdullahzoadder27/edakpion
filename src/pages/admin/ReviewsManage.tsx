import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit, Trash2, CheckCircle, XCircle, Star, MessageCircle, Loader2 } from 'lucide-react';

export default function ReviewsManage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewText, setEditReviewText] = useState('');
  const [editRating, setEditRating] = useState(5);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let query = supabase.from('reviews').select('*, profiles(full_name), products(name)').order('created_at', { ascending: false });
      
      if (filter === 'pending') query = query.eq('status', 'pending');
      else if (filter === 'approved') query = query.eq('status', 'approved');
      else if (filter === 'hidden') query = query.eq('status', 'hidden');
      else if (filter === '5star') query = query.eq('rating', 5);

      const { data, error } = await query;
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.warn('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
      if (error) throw error;
      fetchReviews();
    } catch (err: any) {
      alert(`Error updating review: ${err.message}`);
    }
  };

  
  const submitEdit = async (id: string) => {
    try {
      const { error } = await supabase.from('reviews').update({ review_text: editReviewText, rating: editRating }).eq('id', id);
      if (error) throw error;
      setEditingReviewId(null);
      fetchReviews();
    } catch (err: any) {
      alert(`Error editing: ${err.message}`);
    }
  };

  const submitReply = async (id: string) => {
    try {
      const { error } = await supabase.from('reviews').update({ admin_reply: replyText }).eq('id', id);
      if (error) throw error;
      setReplyingTo(null);
      setReplyText('');
      fetchReviews();
    } catch (err: any) {
      alert(`Error replying: ${err.message}`);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review completely?')) return;
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      fetchReviews();
    } catch (err: any) {
      alert(`Error deleting review: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0F3D2E]">Reviews</h1>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-[#E8E4DE] rounded-xl px-4 py-2">
            <option value="all">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="hidden">Hidden</option>
            <option value="5star">5 Star</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0F3D2E]" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E4DE] shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-[#E8E4DE]">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-700">Product & Customer</th>
                <th className="px-6 py-4 font-bold text-gray-700">Rating & Review</th>
                <th className="px-6 py-4 font-bold text-gray-700">Status</th>
                <th className="px-6 py-4 font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DE]">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{review.products?.name || 'Unknown Product'}</div>
                    <div className="text-gray-500 text-xs mt-1">by {review.profiles?.full_name || 'Anonymous'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex text-yellow-400 mb-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />)}
                    </div>
                    {review.title && <div className="font-bold text-xs">{review.title}</div>}
                    <div className="text-gray-600 italic mt-1 line-clamp-2">"{review.review_text}"</div>
                    {review.admin_reply && (
                      <div className="mt-2 text-xs bg-blue-50 p-2 rounded text-blue-800 border border-blue-100">
                        <span className="font-bold">Reply:</span> {review.admin_reply}
                      </div>
                    )}
                    {replyingTo === review.id && (
                      <div className="mt-2 flex gap-2">
                        <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type reply..." className="border p-1 text-xs rounded flex-1" />
                        <button onClick={() => submitReply(review.id)} className="bg-[#0F3D2E] text-white px-2 py-1 text-xs rounded">Send</button>
                        <button onClick={() => setReplyingTo(null)} className="text-gray-500 text-xs">Cancel</button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      review.status === 'approved' ? 'bg-green-100 text-green-700' :
                      review.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex flex-wrap gap-2">
                    {review.status !== 'approved' && <button onClick={() => updateStatus(review.id, 'approved')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve"><CheckCircle className="w-4 h-4" /></button>}
                    {review.status !== 'hidden' && <button onClick={() => updateStatus(review.id, 'hidden')} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Hide"><XCircle className="w-4 h-4" /></button>}

                    <button onClick={() => { setEditingReviewId(review.id); setEditReviewText(review.review_text); setEditRating(review.rating || 5); }} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setReplyingTo(review.id); setReplyText(review.admin_reply || ''); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Reply">
                      <MessageCircle className="w-4 h-4" />
                    </button>

                    <button onClick={() => deleteReview(review.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No reviews found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
