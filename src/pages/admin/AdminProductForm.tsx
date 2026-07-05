import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compare_at_price: '',
    category_id: '',
    stock: '',
    sku: '',
    status: 'active',
  });
  const [images, setImages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>(['']);
  
  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name');
    if (data) setCategories(data);
  };

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          compare_at_price: data.compare_at_price?.toString() || '',
          category_id: data.category_id || '',
          stock: data.stock?.toString() || '0',
          sku: data.sku || '',
          status: data.status || 'active',
        });
        setImages(data.images || []);
        setFeatures(data.features?.length ? data.features : ['']);
      }
    } catch (err) {
      // console.warn('Error fetching product:', err);
      alert('Error fetching product details');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && !isEdit ? { slug: value.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '') } : {})
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };
  
  const addFeature = () => setFeatures([...features, '']);
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));

  const handleImageUrlChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };
  const addImageUrl = () => setImages([...images, '']);
  const removeImageUrl = (index: number) => setImages(images.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        category_id: formData.category_id || null,
        stock: parseInt(formData.stock) || 0,
        sku: formData.sku,
        status: formData.status,
        images: images.filter(url => url.trim() !== ''),
        features: features.filter(f => f.trim() !== ''),
      };

      if (isEdit) {
        const { error } = await supabase.from('products').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
      }
      
      navigate('/admin/products');
    } catch (err: any) {
      console.warn('Error saving product:', err);
      alert(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8 text-center">Loading product details...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/products" className="p-2 text-gray-500 hover:bg-white rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-[#0F3D2E]">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] space-y-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0F3D2E]">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Product Name</label>
              <input 
                type="text" name="name" required
                value={formData.name} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Slug</label>
              <input 
                type="text" name="slug" required
                value={formData.slug} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Category</label>
              <select 
                name="category_id"
                value={formData.category_id} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Status</label>
              <select 
                name="status"
                value={formData.status} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Description</label>
            <textarea 
              name="description" rows={4}
              value={formData.description} onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 resize-none"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] space-y-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0F3D2E]">Pricing & Inventory</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Price ($)</label>
              <input 
                type="number" step="0.01" name="price" required
                value={formData.price} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Compare at Price ($)</label>
              <input 
                type="number" step="0.01" name="compare_at_price"
                value={formData.compare_at_price} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Stock Quantity</label>
              <input 
                type="number" name="stock" required
                value={formData.stock} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">SKU (Optional)</label>
              <input 
                type="text" name="sku"
                value={formData.sku} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F3D2E]">Images (URLs)</h2>
            <button type="button" onClick={addImageUrl} className="text-sm font-bold text-[#0F3D2E] hover:underline">
              + Add Image URL
            </button>
          </div>
          
          <div className="space-y-3">
            {images.map((img, index) => (
              <div key={index} className="flex items-center gap-2">
                <input 
                  type="url" placeholder="https://example.com/image.jpg"
                  value={img} onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                />
                <button type="button" onClick={() => removeImageUrl(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            {images.length === 0 && <p className="text-sm text-gray-500">No images added yet.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F3D2E]">Features</h2>
            <button type="button" onClick={addFeature} className="text-sm font-bold text-[#0F3D2E] hover:underline">
              + Add Feature
            </button>
          </div>
          
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <input 
                  type="text" placeholder="e.g. 100% Organic Cotton"
                  value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                />
                <button type="button" onClick={() => removeFeature(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            {features.length === 0 && <p className="text-sm text-gray-500">No features added yet.</p>}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link to="/admin/products" className="px-6 py-2.5 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" disabled={loading}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#0F3D2E] hover:bg-[#154636] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
