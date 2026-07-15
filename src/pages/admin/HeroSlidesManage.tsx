import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { HeroSlide } from '../../types';
import { Plus, Edit2, Trash2, Check, X, GripVertical, Image as ImageIcon, Loader2 } from 'lucide-react';


export default function HeroSlidesManage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    desktop_image: '',
    mobile_image: '',
    primary_button_text: '',
    primary_button_url: '',
    secondary_button_text: '',
    secondary_button_url: '',
    badge: '',
    display_order: 0,
    is_active: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        description: slide.description || '',
        image_url: slide.image_url || '',
        desktop_image: slide.desktop_image || '',
        mobile_image: slide.mobile_image || '',
        primary_button_text: slide.primary_button_text || '',
        primary_button_url: slide.primary_button_url || '',
        secondary_button_text: slide.secondary_button_text || '',
        secondary_button_url: slide.secondary_button_url || '',
        badge: slide.badge || '',
        display_order: slide.display_order,
        is_active: slide.is_active
      });
    } else {
      setEditingSlide(null);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        image_url: '',
        desktop_image: '',
        mobile_image: '',
        primary_button_text: '',
        primary_button_url: '',
        secondary_button_text: '',
        secondary_button_url: '',
        badge: '',
        display_order: slides.length,
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSlide(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image_url' | 'desktop_image' | 'mobile_image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `hero-slides/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, [field]: data.publicUrl }));
    } catch (error: any) {
      alert(`Error uploading image: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url && !formData.desktop_image) {
      alert('Please provide at least one image (Hero Image or Desktop Image)');
      return;
    }

    try {
      setSaving(true);
      if (editingSlide) {
        const { error } = await supabase
          .from('hero_slides')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingSlide.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hero_slides')
          .insert([formData]);
        if (error) throw error;
      }
      
      await fetchSlides();
      handleCloseModal();
    } catch (error: any) {
      alert(`Error saving slide: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    
    try {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchSlides();
    } catch (error: any) {
      alert(`Error deleting slide: ${error.message}`);
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      const { error } = await supabase
        .from('hero_slides')
        .update({ is_active: !slide.is_active })
        .eq('id', slide.id);
      if (error) throw error;
      fetchSlides();
    } catch (error: any) {
      alert(`Error updating status: ${error.message}`);
    }
  };

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === slides.length - 1)
    ) return;

    const newSlides = [...slides];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap display_order
    const tempOrder = newSlides[index].display_order;
    newSlides[index].display_order = newSlides[swapIndex].display_order;
    newSlides[swapIndex].display_order = tempOrder;

    // Swap elements in array for optimistic UI
    const tempSlide = newSlides[index];
    newSlides[index] = newSlides[swapIndex];
    newSlides[swapIndex] = tempSlide;
    
    setSlides(newSlides);

    try {
      // Update DB
      await Promise.all([
        supabase.from('hero_slides').update({ display_order: newSlides[index].display_order }).eq('id', newSlides[index].id),
        supabase.from('hero_slides').update({ display_order: newSlides[swapIndex].display_order }).eq('id', newSlides[swapIndex].id)
      ]);
    } catch (error) {
      console.error('Error reordering:', error);
      fetchSlides(); // Revert on error
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3D2E]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E]">Hero Slides</h1>
          <p className="text-gray-600">Manage the homepage hero slider</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F3D2E] text-white rounded-lg hover:bg-[#154636] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Slide
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E4DE] overflow-hidden">
        {slides.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No slides found. Add one to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E4DE]">
            {slides.map((slide, index) => (
              <div key={slide.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="flex flex-col gap-2">
                  <button 
                    disabled={index === 0}
                    onClick={() => moveSlide(index, 'up')}
                    className="p-1 text-gray-400 hover:text-[#0F3D2E] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ▲
                  </button>
                  <button 
                    disabled={index === slides.length - 1}
                    onClick={() => moveSlide(index, 'down')}
                    className="p-1 text-gray-400 hover:text-[#0F3D2E] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ▼
                  </button>
                </div>
                
                <div className="w-full sm:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {slide.image_url || slide.desktop_image ? (
                    <img 
                      src={slide.image_url || slide.desktop_image} 
                      alt={slide.title || 'Slide'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">
                      {slide.title || 'Untitled Slide'}
                    </h3>
                    <button
                      onClick={() => handleToggleActive(slide)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        slide.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {slide.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">{slide.subtitle}</p>
                  
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    {slide.primary_button_text && (
                      <span className="bg-gray-100 px-2 py-1 rounded">Btn 1: {slide.primary_button_text}</span>
                    )}
                    {slide.secondary_button_text && (
                      <span className="bg-gray-100 px-2 py-1 rounded">Btn 2: {slide.secondary_button_text}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenModal(slide)}
                    className="p-2 text-gray-600 hover:text-[#0F3D2E] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-[#E8E4DE] flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#0F3D2E]">
                {editingSlide ? 'Edit Slide' : 'New Slide'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">Images</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hero Image URL (or upload)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                        className="flex-1 rounded-lg border-[#E8E4DE] border px-4 py-2 focus:ring-[#0F3D2E] focus:border-[#0F3D2E]"
                        placeholder="https://..."
                      />
                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-200 flex items-center justify-center whitespace-nowrap">
                        <span className="text-sm">{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'image_url')} disabled={uploadingImage} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Desktop Image URL (Optional specific image for desktop)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.desktop_image}
                        onChange={(e) => setFormData({...formData, desktop_image: e.target.value})}
                        className="flex-1 rounded-lg border-[#E8E4DE] border px-4 py-2 focus:ring-[#0F3D2E] focus:border-[#0F3D2E]"
                        placeholder="https://..."
                      />
                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-200 flex items-center justify-center whitespace-nowrap">
                        <span className="text-sm">{uploadingImage ? '...' : 'Upload'}</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'desktop_image')} disabled={uploadingImage} />
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Image URL (Optional specific image for mobile)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.mobile_image}
                        onChange={(e) => setFormData({...formData, mobile_image: e.target.value})}
                        className="flex-1 rounded-lg border-[#E8E4DE] border px-4 py-2 focus:ring-[#0F3D2E] focus:border-[#0F3D2E]"
                        placeholder="https://..."
                      />
                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-200 flex items-center justify-center whitespace-nowrap">
                        <span className="text-sm">{uploadingImage ? '...' : 'Upload'}</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'mobile_image')} disabled={uploadingImage} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-4 pt-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">Content</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Badge / Tagline</label>
                      <input
                        type="text"
                        value={formData.badge}
                        onChange={(e) => setFormData({...formData, badge: e.target.value})}
                        className="w-full rounded-lg border-[#E8E4DE] border px-4 py-2 focus:ring-[#0F3D2E] focus:border-[#0F3D2E]"
                        placeholder="e.g. New Collection"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full rounded-lg border-[#E8E4DE] border px-4 py-2 focus:ring-[#0F3D2E] focus:border-[#0F3D2E]"
                        placeholder="Main Headline"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                      className="w-full rounded-lg border-[#E8E4DE] border px-4 py-2 focus:ring-[#0F3D2E] focus:border-[#0F3D2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full rounded-lg border-[#E8E4DE] border px-4 py-2 focus:ring-[#0F3D2E] focus:border-[#0F3D2E]"
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-4 pt-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">Buttons</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Text</label>
                      <input
                        type="text"
                        value={formData.primary_button_text}
                        onChange={(e) => setFormData({...formData, primary_button_text: e.target.value})}
                        className="w-full rounded-lg border-[#E8E4DE] border px-4 py-2"
                        placeholder="Shop Now"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button URL</label>
                      <input
                        type="text"
                        value={formData.primary_button_url}
                        onChange={(e) => setFormData({...formData, primary_button_url: e.target.value})}
                        className="w-full rounded-lg border-[#E8E4DE] border px-4 py-2"
                        placeholder="/shop"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Text</label>
                      <input
                        type="text"
                        value={formData.secondary_button_text}
                        onChange={(e) => setFormData({...formData, secondary_button_text: e.target.value})}
                        className="w-full rounded-lg border-[#E8E4DE] border px-4 py-2"
                        placeholder="View Lookbook"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button URL</label>
                      <input
                        type="text"
                        value={formData.secondary_button_url}
                        onChange={(e) => setFormData({...formData, secondary_button_url: e.target.value})}
                        className="w-full rounded-lg border-[#E8E4DE] border px-4 py-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-4 pt-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">Settings</h3>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="w-5 h-5 text-[#0F3D2E] rounded border-gray-300 focus:ring-[#0F3D2E]"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      Active (Visible on homepage)
                    </label>
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#E8E4DE]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#0F3D2E] text-white rounded-lg hover:bg-[#154636] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Save Slide</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
