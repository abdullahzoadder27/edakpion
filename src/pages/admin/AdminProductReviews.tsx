
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ProductReview } from '../../types';
import ReactMarkdown from 'react-markdown';
import { 
  Star, Plus, Edit, Trash2, CheckCircle, XCircle, Search, 
  Filter, Save, X, Eye, EyeOff, GripVertical, CheckSquare, Square, ThumbsUp
} from 'lucide-react';

interface Props {
  productId: string;
}

export default function AdminProductReviews({ productId }: Props) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Partial<ProductReview> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Drag & drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          console.error("product_reviews table doesn't exist");
          setReviews([]);
        } else {
          throw error;
        }
      } else {
        setReviews(data || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cName = editingReview?.customer_name?.trim();
    const cText = editingReview?.review_text?.trim();
    const cRating = editingReview?.rating || 5;
    if (!cName || !cText) {
      alert("Name and Review Text cannot be empty.");
      return;
    }
    if (cRating < 1 || cRating > 5) {
      alert("Rating must be between 1 and 5.");
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    
    // Update editingReview with sanitized values
    const sanitizedReview = {
      ...editingReview,
      customer_name: cName,
      review_text: cText,
      rating: cRating,
      customer_location: editingReview?.customer_location?.trim() || null,
      customer_designation: editingReview?.customer_designation?.trim() || null,
    };

    try {
      if (editingReview.id) {
        const { error } = await supabase
          .from('product_reviews')
          .update(sanitizedReview)
          .eq('id', editingReview.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('product_reviews')
          .insert({
            ...sanitizedReview,
            product_id: productId,
            rating: editingReview.rating || 5,
            status: sanitizedReview.status || 'Published',
            sort_order: reviews.length,
          });
        if (error) throw error;
      }
      setIsModalOpen(false);
      setEditingReview(null);
      fetchReviews();
    } catch (err) {
      console.error('Error saving review:', err);
      alert('Error saving review. Make sure the table is created.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const { error } = await supabase.from('product_reviews').delete().eq('id', id);
      if (error) throw error;
      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('product_reviews').update({ status }).eq('id', id);
      if (error) throw error;
      fetchReviews();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDuplicate = async (review: ProductReview) => {
    const { id, created_at, updated_at, ...rest } = review;
    setEditingReview({ ...rest, customer_name: rest.customer_name + ' (Copy)', status: 'Draft' });
    setIsModalOpen(true);
            setPreviewMode(false);
  };

  // Bulk Actions
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredReviews.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredReviews.map(r => r.id)));
    }
  };

  const handleBulkAction = async (action: 'publish' | 'hide' | 'delete') => {
    if (selectedIds.size === 0) return;
    if (action === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedIds.size} reviews?`)) return;

    try {
      if (action === 'delete') {
        const { error } = await supabase.from('product_reviews').delete().in('id', Array.from(selectedIds));
        if (error) throw error;
      } else {
        const status = action === 'publish' ? 'Published' : 'Hidden';
        const { error } = await supabase.from('product_reviews').update({ status }).in('id', Array.from(selectedIds));
        if (error) throw error;
      }
      setSelectedIds(new Set());
      fetchReviews();
    } catch (err) {
      console.error('Error performing bulk action:', err);
    }
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires setting data
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const newReviews = [...reviews];
    const draggedIndex = newReviews.findIndex(r => r.id === draggedId);
    const targetIndex = newReviews.findIndex(r => r.id === targetId);

    const [draggedItem] = newReviews.splice(draggedIndex, 1);
    newReviews.splice(targetIndex, 0, draggedItem);
    
    // Update sort_order locally
    const updatedReviews = newReviews.map((r, index) => ({ ...r, sort_order: index }));
    setReviews(updatedReviews);
    setDraggedId(null);

    // Save to DB
    try {
      for (const review of updatedReviews) {
        await supabase.from('product_reviews').update({ sort_order: review.sort_order }).eq('id', review.id);
      }
    } catch (err) {
      console.error('Error updating sort order:', err);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.review_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesRating = ratingFilter === 'All' || r.rating.toString() === ratingFilter;
    return matchesSearch && matchesStatus && matchesRating;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            Product Reviews
          </h2>
          <p className="text-sm text-gray-500">Manage customer reviews for this product</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mr-4 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">{selectedIds.size} selected</span>
              <div className="h-4 w-px bg-gray-300 mx-1"></div>
              <button onClick={() => handleBulkAction('publish')} className="text-xs font-medium text-blue-600 hover:text-blue-700">Publish</button>
              <button onClick={() => handleBulkAction('hide')} className="text-xs font-medium text-gray-600 hover:text-gray-800">Hide</button>
              <button onClick={() => handleBulkAction('delete')} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
            </div>
          )}
          <button
            onClick={() => {
              setEditingReview({ 
                rating: 5, 
                status: 'Published', 
                verified_buyer: true,
                review_date: new Date().toISOString()
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-[#0F3D2E] text-white rounded-xl hover:bg-[#0F3D2E]/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Review
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
        >
          <option value="All">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Hidden">Hidden</option>
        </select>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
        >
          <option value="All">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No reviews found</p>
          <p className="text-sm text-gray-400 mt-1">Create a new review to see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 border-b border-gray-100">
            <button onClick={toggleSelectAll} className="mr-4 text-gray-400 hover:text-[#0F3D2E]">
              {selectedIds.size === filteredReviews.length ? <CheckSquare className="w-5 h-5 text-[#0F3D2E]" /> : <Square className="w-5 h-5" />}
            </button>
            <div className="flex-1">Review</div>
            <div className="w-24 text-center">Status</div>
            <div className="w-32 text-right">Actions</div>
          </div>
          {filteredReviews.map((review) => (
            <div 
              key={review.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, review.id)}
              onDragOver={(e) => handleDragOver(e, review.id)}
              onDrop={(e) => handleDrop(e, review.id)}
              className={`bg-white border ${draggedId === review.id ? 'border-[#0F3D2E] opacity-50' : 'border-gray-100'} rounded-xl p-4 flex items-center gap-4 hover:border-gray-300 transition-all cursor-move`}
            >
              <div className="text-gray-300 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5" />
              </div>
              <button onClick={() => toggleSelect(review.id)} className="text-gray-400 hover:text-[#0F3D2E]">
                {selectedIds.has(review.id) ? <CheckSquare className="w-5 h-5 text-[#0F3D2E]" /> : <Square className="w-5 h-5" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className="font-medium text-gray-900 truncate">{review.customer_name}</span>
                  {review.verified_buyer && (
                    <span className="hidden md:inline-flex px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-bold rounded-full items-center gap-1">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm truncate">{review.review_text}</p>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(review.review_date).toLocaleDateString()}
                  {review.admin_note && <span className="ml-2 text-yellow-600 font-medium">Note: {review.admin_note}</span>}
                </div>
              </div>
              
              <div className="w-24 text-center">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  review.status === 'Published' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                  review.status === 'Draft' ? 'bg-gray-50 text-gray-700 border border-gray-200' :
                  'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {review.status}
                </span>
              </div>

              <div className="w-32 flex items-center justify-end gap-1">
                <button
                  onClick={() => handleStatusChange(review.id, review.status === 'Published' ? 'Hidden' : 'Published')}
                  className="p-1.5 text-gray-400 hover:text-[#0F3D2E] hover:bg-[#0F3D2E]/5 rounded-lg transition-colors"
                  title={review.status === 'Published' ? 'Hide' : 'Publish'}
                >
                  {review.status === 'Published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setEditingReview(review); setIsModalOpen(true); }}
                  className="p-1.5 text-gray-400 hover:text-[#0F3D2E] hover:bg-[#0F3D2E]/5 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDuplicate(review)}
                  className="p-1.5 text-gray-400 hover:text-[#0F3D2E] hover:bg-[#0F3D2E]/5 rounded-lg transition-colors"
                  title="Duplicate"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 relative shadow-xl">
            <button
              onClick={() => { setIsModalOpen(false); setEditingReview(null); }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <form onSubmit={handleSave} className="p-6">
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {editingReview?.id ? <Edit className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                  {editingReview?.id ? 'Edit Review' : 'Add New Review'}
                </h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button type="button" onClick={() => setPreviewMode(false)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${!previewMode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Edit</button>
                  <button type="button" onClick={() => setPreviewMode(true)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${previewMode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Preview</button>
                </div>
              </div>
              
              {previewMode ? (
                <div className="border border-gray-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {editingReview?.profile_image ? (
                        <img src={editingReview.profile_image} alt={editingReview.customer_name || 'User'} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                          {(editingReview?.customer_name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{editingReview?.customer_name || 'Customer Name'}</span>
                          {editingReview?.verified_buyer && (
                            <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        {(editingReview?.customer_designation || editingReview?.customer_location) && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {editingReview?.customer_designation} {editingReview?.customer_designation && editingReview?.customer_location ? '•' : ''} {editingReview?.customer_location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(editingReview?.review_date || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < (editingReview?.rating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  
                  <div className="text-gray-700 prose prose-sm max-w-none">
                    <ReactMarkdown>{editingReview?.review_text || 'Review content goes here...'}</ReactMarkdown>
                  </div>

                  {!!editingReview?.helpful_count && editingReview.helpful_count > 0 && (
                    <div className="mt-4 flex items-center gap-1 text-xs text-gray-500">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{editingReview.helpful_count} people found this helpful</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
  
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={editingReview?.customer_name || ''}
                    onChange={(e) => setEditingReview({...editingReview, customer_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating *</label>
                  <select
                    required
                    value={editingReview?.rating || 5}
                    onChange={(e) => setEditingReview({...editingReview, rating: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 font-medium"
                  >
                    {[5,4,3,2,1].map(n => (
                      <option key={n} value={n}>{n} Stars</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Text *</label>
                <textarea
                  required
                  rows={4}
                  value={editingReview?.review_text || ''}
                  onChange={(e) => setEditingReview({...editingReview, review_text: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="datetime-local"
                    value={editingReview?.review_date ? new Date(editingReview.review_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingReview({...editingReview, review_date: new Date(e.target.value).toISOString()})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. New York, USA"
                    value={editingReview?.customer_location || ''}
                    onChange={(e) => setEditingReview({...editingReview, customer_location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editingReview?.status || 'Published'}
                    onChange={(e) => setEditingReview({...editingReview, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 font-medium"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Hidden">Hidden</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Helpful Count</label>
                  <input
                    type="number"
                    min="0"
                    value={editingReview?.helpful_count || 0}
                    onChange={(e) => setEditingReview({...editingReview, helpful_count: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editingReview?.sort_order || 0}
                    onChange={(e) => setEditingReview({...editingReview, sort_order: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editingReview?.profile_image || ''}
                    onChange={(e) => setEditingReview({...editingReview, profile_image: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Verified Purchaser"
                    value={editingReview?.customer_designation || ''}
                    onChange={(e) => setEditingReview({...editingReview, customer_designation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                  />
                </div>
              </div>

              <div className="mb-6 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verified_buyer"
                  checked={editingReview?.verified_buyer || false}
                  onChange={(e) => setEditingReview({...editingReview, verified_buyer: e.target.checked})}
                  className="w-4 h-4 text-[#0F3D2E] rounded focus:ring-[#0F3D2E]"
                />
                <label htmlFor="verified_buyer" className="text-sm font-medium text-gray-700">
                  Verified Buyer Badge
                </label>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (Private)</label>
                <textarea
                  rows={2}
                  value={editingReview?.admin_note || ''}
                  onChange={(e) => setEditingReview({...editingReview, admin_note: e.target.value})}
                  className="w-full px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none text-sm"
                  placeholder="Notes visible only to admins..."
                />
              </div>

              </>
              )}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  {editingReview?.status === 'Draft' ? 'Saving as draft will not publish the review.' : 'Publishing will immediately make this visible.'}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-[#0F3D2E] text-white font-medium rounded-xl hover:bg-[#0F3D2E]/90 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Review'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
