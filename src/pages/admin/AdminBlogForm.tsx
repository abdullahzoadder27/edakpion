import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';

export default function AdminBlogForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    status: 'draft',
    cover_image_url: ''
  });

  useEffect(() => {
    if (isEditing) {
      const fetchBlog = async () => {
        const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
        if (data) {
          setFormData({
            title: data.title || '',
            slug: data.slug || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
            category: data.category || '',
            status: data.status || 'draft',
            cover_image_url: data.cover_image_url || ''
          });
        }
        setLoading(false);
      };
      fetchBlog();
    }
  }, [id, isEditing]);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: !isEditing ? generateSlug(title) : prev.slug
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      setSaving(true);
      
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath);
      
      setFormData(prev => ({
        ...prev,
        cover_image_url: data.publicUrl
      }));
      alert('Image uploaded successfully');
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload = {
        ...formData,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      if (isEditing) {
        const { error } = await supabase.from('blogs').update(payload).eq('id', id);
        if (error) throw error;
        alert('Blog updated successfully');
      } else {
        const { error } = await supabase.from('blogs').insert([payload]);
        if (error) throw error;
        alert('Blog created successfully');
      }
      navigate('/admin/blogs');
    } catch (err: any) {
      console.warn(err);
      alert('Error saving blog: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/blogs" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-serif text-[#0F3D2E]">
            {isEditing ? 'Edit Blog' : 'Create Blog'}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-[#0F3D2E] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#154636] transition-colors text-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Blog'}
        </button>
      </div>

      <form className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#0F3D2E]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              name="slug"
              required
              value={formData.slug}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#0F3D2E] bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Fashion Tips"
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#0F3D2E]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#0F3D2E]"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
            <div className="flex gap-4 items-start">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  name="cover_image_url"
                  value={formData.cover_image_url}
                  onChange={handleChange}
                  placeholder="https://... or upload below"
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#0F3D2E]"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={saving}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#0F3D2E]/10 file:text-[#0F3D2E]
                    hover:file:bg-[#0F3D2E]/20
                  "
                />
              </div>
              {formData.cover_image_url && (
                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                  <img src={formData.cover_image_url} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#0F3D2E]"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown supported)</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={15}
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#0F3D2E] font-mono text-sm"
              placeholder="# Markdown Heading&#10;&#10;Write your article content here..."
            ></textarea>
          </div>
        </div>
      </form>
    </div>
  );
}
