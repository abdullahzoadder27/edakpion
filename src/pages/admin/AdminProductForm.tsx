import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Loader2, ArrowLeft, Upload, Trash2, X, Plus, GripVertical, 
  AlertCircle, CheckCircle2, ChevronDown, Package, Tag, 
  Image as ImageIcon, FileText, Settings, BarChart3, Truck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Category, Product } from '../../types';

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  compare_at_price: string;
  category_id: string;
  stock: string;
  is_active: boolean;
  seo_title: string;
  seo_description: string;
  sku: string;
  status: 'draft' | 'published' | 'hidden' | 'out_of_stock';
  features: {
    short_description?: string;
    brand?: string;
    barcode?: string;
    subcategory?: string;
    collection?: string;
    gender?: string;
    season?: string;
    occasion?: string;
    cost_price?: string;
    track_inventory?: boolean;
    low_stock_alert?: string;
    unlimited_stock?: boolean;
    allow_backorders?: boolean;
    warehouse?: string;
    fabric?: string;
    fit?: string;
    sleeve_type?: string;
    material?: string;
    gsm?: string;
    origin?: string;
    weight?: string;
    care_instructions?: string;
    warranty?: string;
    label_featured?: boolean;
    label_new_arrival?: boolean;
    label_best_seller?: boolean;
    label_trending?: boolean;
    label_limited?: boolean;
    label_exclusive?: boolean;
    seo_keyword?: string;
    seo_canonical?: string;
    shipping_weight?: string;
    shipping_length?: string;
    shipping_width?: string;
    shipping_height?: string;
    shipping_class?: string;
    free_shipping?: boolean;
    [key: string]: any;
  };
}

const defaultFeatures = {
  short_description: '', brand: 'EDAKPION', barcode: '', subcategory: '', 
  collection: '', gender: 'Men', season: 'All Season', occasion: 'Casual', 
  cost_price: '', track_inventory: true, low_stock_alert: '5', unlimited_stock: false, 
  allow_backorders: false, warehouse: 'Main', fabric: '', fit: 'Regular', 
  sleeve_type: 'Short', material: '100% Cotton', gsm: '180', origin: 'Bangladesh', 
  weight: '', care_instructions: 'Machine wash cold', warranty: '', 
  label_featured: false, label_new_arrival: false, label_best_seller: false, 
  label_trending: false, label_limited: false, label_exclusive: false,
  seo_keyword: '', seo_canonical: '', shipping_weight: '0.2', shipping_length: '', 
  shipping_width: '', shipping_height: '', shipping_class: 'Standard', free_shipping: false
};

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [images, setImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [colors, setColors] = useState<string[]>(['Black', 'White']);
  const [tags, setTags] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    price: '',
    compare_at_price: '',
    category_id: '',
    stock: '10',
    is_active: true,
    seo_title: '',
    seo_description: '',
    sku: '',
    status: 'published',
    features: { ...defaultFeatures }
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProduct = async () => {
    try {
      setInitialLoading(true);
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
          is_active: data.is_active !== false,
          seo_title: data.seo_title || '',
          seo_description: data.seo_description || '',
          sku: data.sku || '',
          status: data.status || 'published',
          features: (() => {
            let parsed = { ...defaultFeatures };
            if (data.features) {
              if (Array.isArray(data.features) && data.features.length > 0) {
                try {
                  const first = data.features[0];
                  if (typeof first === 'string' && first.startsWith('{')) {
                    parsed = { ...parsed, ...JSON.parse(first) };
                  }
                } catch (e) {}
              } else if (typeof data.features === 'object' && !Array.isArray(data.features)) {
                parsed = { ...parsed, ...data.features };
              }
            }
            return parsed;
          })()
        });
        setImages(data.images || []);
        setSizes(data.sizes?.length ? data.sizes : []);
        setColors(data.colors?.length ? data.colors : []);
        setTags(data.tags?.length ? data.tags : []);
      }
    } catch (err: any) {
      setErrorMsg('Failed to load product: ' + err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'name' && !id && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }));
      return;
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name.startsWith('feature_')) {
        const featureName = name.replace('feature_', '');
        setFormData(prev => ({ ...prev, features: { ...prev.features, [featureName]: checked } }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      if (name.startsWith('feature_')) {
        const featureName = name.replace('feature_', '');
        setFormData(prev => ({ ...prev, features: { ...prev.features, [featureName]: value } }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  // Image Management
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setErrorMsg('');
    
    try {
      const newImages = [...images];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, { upsert: false });
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        if (data?.publicUrl) {
          newImages.push(data.publicUrl);
        }
      }
      setImages(newImages);
    } catch (err: any) {
      setErrorMsg('Image upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  
  // Arrays Management
  const handleArrayChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => {
      const arr = [...prev];
      arr[index] = value;
      return arr;
    });
  };

  const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (!formData.name) throw new Error('Product name is required.');
      if (!formData.price) throw new Error('Price is required.');
      if (!formData.category_id) throw new Error('Category is required.');
      if (images.length === 0) throw new Error('At least one image is required.');

      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        category_id: formData.category_id || null,
        stock: parseInt(formData.stock) || 0,
        is_active: formData.is_active,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        sku: formData.sku || `EDK-${Math.floor(1000 + Math.random() * 9000)}`,
        status: formData.status,
        features: [JSON.stringify(formData.features)],
        images: images.filter(url => url.trim() !== ''),
        sizes: sizes.filter(s => s.trim() !== ''),
        colors: colors.filter(c => c.trim() !== ''),
        tags: tags.filter(t => t.trim() !== ''),
        updated_at: new Date().toISOString()
      };

      console.log("Payload:", payload);

      if (id) {
        const response = await supabase.from('products').update(payload).eq('id', id);
        console.log("Update Response:", response);
        const { error } = response;
        if (error) {
          console.error("Supabase Error:", error);
          if (error.code === '23505') throw new Error('A product with this slug already exists.');
          if (error.code === '22P02') throw new Error('Invalid data format submitted.');
          if (error.code === '42501') throw new Error('Permission denied. Ensure you are an admin.');
          throw new Error('Database constraint violation or update failed.');
        }
        setSuccessMsg('Product updated successfully!');
      } else {
        const response = await supabase.from('products').insert([{ ...payload, created_at: new Date().toISOString() }]);
        console.log("Insert Response:", response);
        const { error } = response;
        if (error) {
          console.error("Supabase Error:", error);
          if (error.code === '23505') throw new Error('A product with this slug already exists.');
          if (error.code === '22P02') throw new Error('Invalid data format submitted.');
          if (error.code === '42501') throw new Error('Permission denied. Ensure you are an admin.');
          throw new Error('Database constraint violation or insert failed.');
        }
        setSuccessMsg('Product created successfully!');
        navigate('/admin/products');
      }
    } catch (err: any) {
      console.error("Save Error:", err);
      let errMsg = err.message || 'An error occurred while saving the product.';
      if (errMsg.includes('JSON')) errMsg = 'Invalid data format or missing required fields.';
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3D2E]" />
      </div>
    );
  }

  // Calculated fields
  const costPrice = parseFloat(formData.features.cost_price || '0');
  const sellingPrice = parseFloat(formData.price || '0');
  const comparePrice = parseFloat(formData.compare_at_price || '0');
  
  const profitMargin = sellingPrice > 0 && costPrice > 0 
    ? Math.round(((sellingPrice - costPrice) / sellingPrice) * 100) 
    : 0;
    
  const discountPercent = comparePrice > sellingPrice 
    ? Math.round(((comparePrice - sellingPrice) / comparePrice) * 100) 
    : 0;

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: FileText },
    { id: 'media', name: 'Media', icon: ImageIcon },
    { id: 'pricing', name: 'Pricing & Inventory', icon: BarChart3 },
    { id: 'variants', name: 'Variants & Specs', icon: Package },
    { id: 'shipping', name: 'Shipping', icon: Truck },
    { id: 'seo', name: 'SEO & Labels', icon: Tag },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/products" className="p-2 bg-white rounded-full hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{id ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-gray-500 text-sm mt-1">Complete the information below to {id ? 'update' : 'create'} your product.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="font-medium text-sm">{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="font-medium text-sm">{successMsg}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-[#E8E4DE] shadow-sm overflow-hidden sticky top-6">
            <nav className="flex flex-col">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-l-4 ${
                      isActive 
                        ? 'border-[#0F3D2E] bg-[#0F3D2E]/5 text-[#0F3D2E]' 
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#0F3D2E]' : 'text-gray-400'}`} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-[#E8E4DE] bg-gray-50">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full px-4 py-3 bg-[#0F3D2E] text-white rounded-xl font-bold text-sm hover:bg-[#154636] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Product'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* TAB: BASIC INFO */}
            {activeTab === 'basic' && (
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8E4DE] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                    <input 
                      type="text" name="name" required
                      value={formData.name} onChange={handleChange}
                      placeholder="e.g. Premium Essential Oversized Tee"
                      className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug</label>
                      <input 
                        type="text" name="slug"
                        value={formData.slug} onChange={handleChange}
                        placeholder="premium-essential-oversized-tee"
                        className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                      <select 
                        name="category_id" required
                        value={formData.category_id} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 transition-all appearance-none"
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Short Description</label>
                    <textarea 
                      name="feature_short_description" rows={2}
                      value={formData.features.short_description} onChange={handleChange}
                      placeholder="Brief highlight of the product..."
                      className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 transition-all resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Description</label>
                    <textarea 
                      name="description" rows={8}
                      value={formData.description} onChange={handleChange}
                      placeholder="Detailed product description (HTML supported)..."
                      className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 transition-all"
                    />
                  </div>


                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                      <select name="feature_gender" value={formData.features.gender} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20">
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                        <option value="Kids">Kids</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Season</label>
                      <select name="feature_season" value={formData.features.season} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20">
                        <option value="All Season">All Season</option>
                        <option value="Summer">Summer</option>
                        <option value="Winter">Winter</option>
                        <option value="Spring">Spring</option>
                        <option value="Autumn">Autumn</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Occasion</label>
                      <select name="feature_occasion" value={formData.features.occasion} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20">
                        <option value="Casual">Casual</option>
                        <option value="Formal">Formal</option>
                        <option value="Sports">Sports</option>
                        <option value="Streetwear">Streetwear</option>
                        <option value="Lounge">Lounge</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Collection</label>
                      <input type="text" name="feature_collection" value={formData.features.collection} onChange={handleChange} placeholder="e.g. Summer 24" className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
                      <input type="text" name="feature_brand" value={formData.features.brand} onChange={handleChange} placeholder="e.g. EDAKPION" className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Warranty (Optional)</label>
                      <input type="text" name="feature_warranty" value={formData.features.warranty} onChange={handleChange} placeholder="e.g. 6 Months" className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20" />
                    </div>
                  </div>

                  
                  <div className="pt-6 border-t border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Internal Admin Notes</label>
                    <textarea 
                      name="feature_admin_notes" rows={3}
                      value={formData.features.admin_notes || ''} onChange={handleChange}
                      placeholder="Only visible to admins..."
                      className="w-full px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                      <select 
                        name="status"
                        value={formData.status} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="hidden">Hidden</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Visibility</label>
                      <div className="flex items-center h-[50px]">
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input type="checkbox" name="is_active" className="sr-only" checked={formData.is_active} onChange={handleChange} />
                            <div className={`block w-14 h-8 rounded-full transition-colors ${formData.is_active ? 'bg-[#0F3D2E]' : 'bg-gray-300'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.is_active ? 'transform translate-x-6' : ''}`}></div>
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-700">
                            {formData.is_active ? 'Active on Store' : 'Inactive'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                
                  <div className="pt-6 border-t border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Product Video URL</label>
                    <input 
                      type="url" name="feature_video_url"
                      value={formData.features.video_url || ''} onChange={handleChange}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                    />
                  </div>

                </div>
              </div>
            )}

            {/* TAB: MEDIA */}
            {activeTab === 'media' && (
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8E4DE] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Product Images</h2>
                  <span className="text-sm text-gray-500">{images.length} images added</span>
                </div>
                
                <div className="space-y-6">
                  {/* Image Grid */}
                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((img, index) => (
                        <div key={index} className="relative aspect-square border border-[#E8E4DE] rounded-xl overflow-hidden group bg-gray-50">
                          <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button 
                              type="button" onClick={() => removeImage(index)}
                              className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg transform scale-0 group-hover:scale-100 duration-200"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-[10px] font-bold rounded uppercase tracking-wider backdrop-blur-sm">
                              Featured
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#0F3D2E] hover:bg-gray-50 transition-colors group">
                        {uploading ? (
                          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#0F3D2E]/10 transition-colors">
                              <Plus className="w-6 h-6 text-gray-500 group-hover:text-[#0F3D2E]" />
                            </div>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-[#0F3D2E]">Add More</span>
                          </>
                        )}
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                      </label>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:border-[#0F3D2E] transition-colors bg-gray-50">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Product Images</h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                        Drag and drop your images here, or click to browse. Supported formats: JPG, PNG, WEBP. First image will be the featured image.
                      </p>
                      <label className="px-6 py-3 bg-white border border-[#E8E4DE] text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
                        {uploading ? 'Uploading...' : 'Browse Files'}
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                      </label>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      <strong>Pro tip:</strong> Use high-quality WebP images with a 3:4 aspect ratio (e.g. 1200x1600px) for best results. Keep file sizes under 500KB for fast loading.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRICING & INVENTORY */}
            {activeTab === 'pricing' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Pricing Card */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8E4DE] shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Pricing</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Selling Price (৳) *</label>
                      <input 
                        type="number" step="0.01" name="price" required
                        value={formData.price} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 font-mono text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Compare at Price (৳)</label>
                      <input 
                        type="number" step="0.01" name="compare_at_price"
                        value={formData.compare_at_price} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 font-mono text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Cost per item (৳)</label>
                      <input 
                        type="number" step="0.01" name="feature_cost_price"
                        value={formData.features.cost_price} onChange={handleChange}
                        placeholder="Customers won't see this"
                        className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 font-mono text-lg text-gray-600"
                      />
                    </div>
                  </div>
                  
                  {/* Profit Margins Display */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                    <div className="bg-gray-50 p-4 rounded-xl border border-[#E8E4DE]">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Profit Margin</p>
                      <p className={`text-xl font-bold ${profitMargin > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {profitMargin}%
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-[#E8E4DE]">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Discount Amount</p>
                      <p className={`text-xl font-bold ${discountPercent > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {discountPercent > 0 ? `-${discountPercent}%` : '0%'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inventory Card */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8E4DE] shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Inventory Management</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">SKU (Stock Keeping Unit)</label>
                      <input 
                        type="text" name="sku"
                        value={formData.sku} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Barcode (ISBN, UPC, GTIN)</label>
                      <input 
                        type="text" name="feature_barcode"
                        value={formData.features.barcode} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-t border-gray-100 pt-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Total Stock Quantity *</label>
                      <input 
                        type="number" name="stock" required
                        value={formData.stock} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 font-mono text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Low Stock Alert Threshold</label>
                      <input 
                        type="number" name="feature_low_stock_alert"
                        value={formData.features.low_stock_alert} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 font-mono text-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="feature_track_inventory" checked={formData.features.track_inventory} onChange={handleChange} className="w-5 h-5 text-[#0F3D2E] rounded focus:ring-[#0F3D2E]" />
                      <span className="text-sm text-gray-700 font-medium">Track inventory for this product</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="feature_allow_backorders" checked={formData.features.allow_backorders} onChange={handleChange} className="w-5 h-5 text-[#0F3D2E] rounded focus:ring-[#0F3D2E]" />
                      <span className="text-sm text-gray-700 font-medium">Allow customers to purchase this product when it's out of stock (Backorders)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: VARIANTS & SPECS */}
            {activeTab === 'variants' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Options Card */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8E4DE] shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Variants (Options)</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Sizes */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-bold text-gray-700">Available Sizes</label>
                        <button type="button" onClick={() => addArrayItem(setSizes)} className="text-xs font-bold text-[#0F3D2E] hover:underline flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add Size
                        </button>
                      </div>
                      <div className="space-y-2">
                        {sizes.map((size, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input 
                              type="text" value={size} onChange={(e) => handleArrayChange(setSizes, index, e.target.value)}
                              placeholder="e.g. S, M, XL"
                              className="flex-1 px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                            />
                            <button type="button" onClick={() => removeArrayItem(setSizes, index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        {sizes.length === 0 && <p className="text-sm text-gray-500 italic">No sizes added.</p>}
                      </div>
                    </div>
                    
                    {/* Colors */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-bold text-gray-700">Available Colors</label>
                        <button type="button" onClick={() => addArrayItem(setColors)} className="text-xs font-bold text-[#0F3D2E] hover:underline flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add Color
                        </button>
                      </div>
                      <div className="space-y-2">
                        {colors.map((color, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input 
                              type="text" value={color} onChange={(e) => handleArrayChange(setColors, index, e.target.value)}
                              placeholder="e.g. Black, Navy"
                              className="flex-1 px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                            />
                            <button type="button" onClick={() => removeArrayItem(setColors, index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        {colors.length === 0 && <p className="text-sm text-gray-500 italic">No colors added.</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specifications Card */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8E4DE] shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Specifications</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Material</label>
                      <input type="text" name="feature_material" value={formData.features.material} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">GSM (Fabric Weight)</label>
                      <input type="text" name="feature_gsm" value={formData.features.gsm} onChange={handleChange} placeholder="e.g. 180, 220" className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Fit</label>
                      <input type="text" name="feature_fit" value={formData.features.fit} onChange={handleChange} placeholder="e.g. Oversized, Regular, Slim" className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Country of Origin</label>
                      <input type="text" name="feature_origin" value={formData.features.origin} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Care Instructions</label>
                      <input type="text" name="feature_care_instructions" value={formData.features.care_instructions} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SHIPPING */}
            {activeTab === 'shipping' && (
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8E4DE] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping</h2>
                
                <div className="space-y-6">
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-[#E8E4DE] rounded-xl bg-gray-50">
                    <input type="checkbox" name="feature_free_shipping" checked={formData.features.free_shipping} onChange={handleChange} className="w-5 h-5 text-[#0F3D2E] rounded focus:ring-[#0F3D2E]" />
                    <div>
                      <span className="block text-sm text-gray-900 font-bold">This is a physical product that requires shipping</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Uncheck this if you are selling a digital product or service.</span>
                    </div>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Weight (kg)</label>
                      <input type="number" step="0.01" name="feature_shipping_weight" value={formData.features.shipping_weight} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Shipping Class</label>
                      <select name="feature_shipping_class" value={formData.features.shipping_class} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20">
                        <option value="Standard">Standard Shipping</option>
                        <option value="Heavy">Heavy/Bulky Item</option>
                        <option value="Fragile">Fragile</option>
                        <option value="Free">Free Shipping</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SEO & LABELS */}
            {activeTab === 'seo' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Labels Card */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8E4DE] shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Marketing Labels</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { name: 'feature_label_featured', label: 'Featured Product' },
                      { name: 'feature_label_new_arrival', label: 'New Arrival' },
                      { name: 'feature_label_best_seller', label: 'Best Seller' },
                      { name: 'feature_label_trending', label: 'Trending' },
                      { name: 'feature_label_limited', label: 'Limited Edition' },
                      { name: 'feature_label_exclusive', label: 'Online Exclusive' },
                    ].map(l => (
                      <label key={l.name} className="flex items-center gap-3 cursor-pointer p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <input type="checkbox" name={l.name} checked={formData.features[l.name.replace('feature_', '')]} onChange={handleChange} className="w-4 h-4 text-[#0F3D2E] rounded focus:ring-[#0F3D2E]" />
                        <span className="text-sm font-medium text-gray-700">{l.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* SEO Card */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8E4DE] shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Search Engine Optimization</h2>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Good</span>
                  </div>
                  
                  <div className="space-y-6">
                    {/* SEO Preview */}
                    <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                      <p className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-wider">Search Engine Preview</p>
                      <h3 className="text-[#1a0dab] text-lg hover:underline cursor-pointer truncate">
                        {formData.seo_title || formData.name || 'Product Title'} | EDAKPION
                      </h3>
                      <p className="text-[#006621] text-sm truncate mb-1">
                        https://edakpion.com/product/{formData.slug || 'product-slug'}
                      </p>
                      <p className="text-[#545454] text-sm line-clamp-2">
                        {formData.seo_description || formData.features.short_description || 'Product description will appear here in search engine results. Write a compelling description.'}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">SEO Title</label>
                        <span className="text-xs text-gray-400">{formData.seo_title.length}/60</span>
                      </div>
                      <input 
                        type="text" name="seo_title" value={formData.seo_title} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">Meta Description</label>
                        <span className="text-xs text-gray-400">{formData.seo_description.length}/160</span>
                      </div>
                      <textarea 
                        name="seo_description" rows={3} value={formData.seo_description} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Save Button (Sticky bottom) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E8E4DE] z-50">
              <button
                type="submit" disabled={loading}
                className="w-full px-6 py-4 bg-[#0F3D2E] text-white rounded-xl font-bold text-sm hover:bg-[#154636] transition-colors disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Product'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
