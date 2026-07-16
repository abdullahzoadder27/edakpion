const fs = require('fs');

const filepath = 'src/pages/admin/HeroSlidesManage.tsx';

const newContent = `import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { HeroSlide } from '../../types';
import { Plus, Edit2, Trash2, Check, X, Image as ImageIcon, Loader2, GripVertical, Copy, Eye, EyeOff, Archive } from 'lucide-react';

export default function HeroSlidesManage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [saving, setSaving] = useState(false);
  
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
    is_active: true,
    status: 'Published',
    background_color: '#0F3D2E',
    panel_color: '#154636',
    ghost_text: '',
    animation_type: 'fade',
    autoplay_duration: 5000,
    start_date: '',
    end_date: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [draggedSlideId, setDraggedSlideId] = useState<string | null>(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setSlides(data || []);
    } catch (err) {
      console.error('Error fetching slides:', err);
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
        display_order: slide.display_order || 0,
        is_active: slide.is_active !== false,
        status: slide.status || 'Published',
        background_color: slide.background_color || '#0F3D2E',
        panel_color: slide.panel_color || '#154636',
        ghost_text: slide.ghost_text || '',
        animation_type: slide.animation_type || 'fade',
        autoplay_duration: slide.autoplay_duration || 5000,
        start_date: slide.start_date ? new Date(slide.start_date).toISOString().slice(0, 16) : '',
        end_date: slide.end_date ? new Date(slide.end_date).toISOString().slice(0, 16) : ''
      });
    } else {
      setEditingSlide(null);
      setFormData({
        title: '', subtitle: '', description: '', image_url: '', desktop_image: '', mobile_image: '',
        primary_button_text: '', primary_button_url: '', secondary_button_text: '', secondary_button_url: '',
        badge: '', display_order: slides.length, is_active: true, status: 'Published', background_color: '#0F3D2E', panel_color: '#154636', ghost_text: '', animation_type: 'fade', autoplay_duration: 5000, start_date: '', end_date: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSlide(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        is_active: ['Published', 'Draft'].includes(formData.status) ? formData.is_active : false,
      };

      if (editingSlide) {
        const { error } = await supabase.from('hero_slides').update(payload).eq('id', editingSlide.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('hero_slides').insert([payload]);
        if (error) throw error;
      }
      await fetchSlides();
      handleCloseModal();
    } catch (err: any) {
      alert('Error saving slide: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    try {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
      await fetchSlides();
    } catch (err: any) {
      alert('Error deleting slide: ' + err.message);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('hero_slides').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      await fetchSlides();
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDuplicate = async (slide: HeroSlide) => {
    try {
      const { id, created_at, updated_at, ...rest } = slide;
      const { error } = await supabase.from('hero_slides').insert([{ ...rest, title: rest.title + ' (Copy)' }]);
      if (error) throw error;
      await fetchSlides();
    } catch (err: any) {
      alert('Error duplicating slide: ' + err.message);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedSlideId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedSlideId || draggedSlideId === targetId) return;

    const draggedIndex = slides.findIndex(s => s.id === draggedSlideId);
    const targetIndex = slides.findIndex(s => s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newSlides = [...slides];
    const [draggedItem] = newSlides.splice(draggedIndex, 1);
    newSlides.splice(targetIndex, 0, draggedItem);

    const updatedSlides = newSlides.map((slide, index) => ({
      ...slide,
      display_order: index
    }));

    setSlides(updatedSlides);
    setDraggedSlideId(null);

    try {
      const updates = updatedSlides.map(slide => ({
        id: slide.id,
        display_order: slide.display_order
      }));
      const { error } = await supabase.from('hero_slides').upsert(updates);
      if (error) throw error;
    } catch (err: any) {
      console.error('Error reordering slides:', err);
      fetchSlides(); // Revert on failure
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'desktop_image' | 'mobile_image' | 'image_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = \`\${Math.random()}.\${fileExt}\`;
      const filePath = \`hero_slides/\${fileName}\`;

      const { error: uploadError } = await supabase.storage
        .from('products') // using existing bucket if hero_slides doesn't exist
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('products').getPublicUrl(filePath);
      
      setFormData(prev => ({
        ...prev,
        [field]: data.publicUrl,
        ...(field === 'desktop_image' && !prev.image_url ? { image_url: data.publicUrl } : {})
      }));
    } catch (err: any) {
      alert('Error uploading image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Hero Slides</h1>
          <p className="text-sm text-gray-500">Manage the homepage hero carousel</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#0F3D2E] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#154636] transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Slide
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-sm text-gray-500">
                <th className="p-4 font-medium w-10"></th>
                <th className="p-4 font-medium w-24">Image</th>
                <th className="p-4 font-medium">Content</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slides.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No slides found. Click "Add Slide" to create one.
                  </td>
                </tr>
              ) : (
                slides.map((slide) => (
                  <tr 
                    key={slide.id} 
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    draggable
                    onDragStart={(e) => handleDragStart(e, slide.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, slide.id)}
                  >
                    <td className="p-4">
                      <div className="cursor-grab hover:text-gray-900 text-gray-400">
                        <GripVertical className="w-5 h-5" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="w-20 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        {slide.desktop_image || slide.image_url ? (
                          <img src={slide.desktop_image || slide.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{slide.title || 'Untitled'}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{slide.subtitle}</div>
                    </td>
                    <td className="p-4">
                      <span className={\`inline-flex px-2 py-1 rounded-full text-xs font-medium
                        \${slide.status === 'Published' ? 'bg-green-100 text-green-700' : ''}
                        \${slide.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : ''}
                        \${slide.status === 'Hidden' ? 'bg-gray-100 text-gray-700' : ''}
                        \${slide.status === 'Archived' ? 'bg-red-100 text-red-700' : ''}
                      \`}>
                        {slide.status || 'Published'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {slide.status === 'Hidden' ? (
                          <button onClick={() => handleUpdateStatus(slide.id, 'Published')} className="p-2 text-gray-400 hover:text-green-600 bg-white hover:bg-green-50 rounded-lg border border-gray-200 shadow-sm transition-colors" title="Publish">
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => handleUpdateStatus(slide.id, 'Hidden')} className="p-2 text-gray-400 hover:text-yellow-600 bg-white hover:bg-yellow-50 rounded-lg border border-gray-200 shadow-sm transition-colors" title="Hide">
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDuplicate(slide)} className="p-2 text-gray-400 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 shadow-sm transition-colors" title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleUpdateStatus(slide.id, 'Archived')} className="p-2 text-gray-400 hover:text-purple-600 bg-white hover:bg-purple-50 rounded-lg border border-gray-200 shadow-sm transition-colors" title="Archive">
                          <Archive className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenModal(slide)} className="p-2 text-gray-400 hover:text-[#0F3D2E] bg-white hover:bg-[#0F3D2E]/5 rounded-lg border border-gray-200 shadow-sm transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(slide.id)} className="p-2 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-lg border border-gray-200 shadow-sm transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-900">
                {editingSlide ? 'Edit Slide' : 'Add New Slide'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm hover:shadow transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">
                
                {/* Images */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Media & Layout</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Desktop Image</label>
                      <div className="flex gap-2">
                        <input type="url" value={formData.desktop_image || formData.image_url} onChange={(e) => setFormData({...formData, desktop_image: e.target.value})} className="flex-1 rounded-lg border-[#E8E4DE] border px-3 py-2 text-sm" placeholder="https://..." />
                        <label className="cursor-pointer bg-gray-100 px-3 py-2 rounded-lg border border-gray-200"><span className="text-sm">Upload</span><input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'desktop_image')} disabled={uploadingImage} /></label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Image</label>
                      <div className="flex gap-2">
                        <input type="url" value={formData.mobile_image} onChange={(e) => setFormData({...formData, mobile_image: e.target.value})} className="flex-1 rounded-lg border-[#E8E4DE] border px-3 py-2 text-sm" placeholder="https://..." />
                        <label className="cursor-pointer bg-gray-100 px-3 py-2 rounded-lg border border-gray-200"><span className="text-sm">Upload</span><input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'mobile_image')} disabled={uploadingImage} /></label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                      <input type="color" value={formData.background_color} onChange={(e) => setFormData({...formData, background_color: e.target.value})} className="h-10 w-full rounded-lg cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Panel Color</label>
                      <input type="color" value={formData.panel_color} onChange={(e) => setFormData({...formData, panel_color: e.target.value})} className="h-10 w-full rounded-lg cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Content & Typography</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full rounded-lg border-[#E8E4DE] border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                      <input type="text" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="w-full rounded-lg border-[#E8E4DE] border px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghost Text (Background text)</label>
                    <input type="text" value={formData.ghost_text} onChange={(e) => setFormData({...formData, ghost_text: e.target.value})} className="w-full rounded-lg border-[#E8E4DE] border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full rounded-lg border-[#E8E4DE] border px-3 py-2 text-sm resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                    <input type="text" value={formData.badge} onChange={(e) => setFormData({...formData, badge: e.target.value})} className="w-full rounded-lg border-[#E8E4DE] border px-3 py-2 text-sm" />
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Buttons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary CTA Text</label>
                      <input type="text" value={formData.primary_button_text} onChange={(e) => setFormData({...formData, primary_button_text: e.target.value})} className="w-full rounded-lg border-[#E8E4DE] border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary CTA URL</label>
                      <input type="text" value={formData.primary_button_url} onChange={(e) => setFormData({...formData, primary_button_url: e.target.value})} className="w-full rounded-lg border-[#E8E4DE] border px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secondary CTA Text</label>
                      <input type="text" value={formData.secondary_button_text} onChange={(e) => setFormData({...formData, secondary_button_text: e.target.value})} className="w-full rounded-lg border-[#E8E4DE] border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secondary CTA URL</label>
                      <input type="text" value={formData.secondary_button_url} onChange={(e) => setFormData({...formData, secondary_button_url: e.target.value})} className="w-full rounded-lg border-[#E8E4DE] border px-3 py-2 text-sm" />
                    </div>
                  </div>
                </div>

                {/* Status & Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Settings & Scheduling</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full rounded-lg border-[#E8E4DE] border px-3 py-2 text-sm">
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                        <option value="Hidden">Hidden</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Animation</label>
                      <select value={formData.animation_type} onChange={(e) => setFormData({...formData, animation_type: e.target.value})} className="w-full rounded-lg border-[#E8E4DE] border px-3 py-2 text-sm">
                        <option value="fade">Fade</option>
                        <option value="slide">Slide</option>
                        <option value="zoom">Zoom</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Autoplay (ms)</label>
                      <input type="number" value={formData.autoplay_duration} onChange={(e) => setFormData({...formData, autoplay_duration: parseInt(e.target.value) || 5000})} className="w-full rounded-lg border-[#E8E4DE] border px-3 py-2 text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Publish Date</label>
                      <input type="datetime-local" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} className="w-full rounded-lg border-[#E8E4DE] border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Expire Date</label>
                      <input type="datetime-local" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} className="w-full rounded-lg border-[#E8E4DE] border px-3 py-2 text-sm" />
                    </div>
                  </div>
                </div>

              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-white transition-colors bg-white shadow-sm font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-[#0F3D2E] text-white rounded-xl hover:bg-[#154636] transition-colors disabled:opacity-50 flex items-center gap-2 font-medium shadow-sm">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Slide</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(filepath, newContent);
console.log('Successfully wrote new HeroSlidesManage.tsx');
