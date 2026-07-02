import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Box, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { migrateDemoProducts } from '../../utils/migrateProducts';
import { motion } from 'motion/react';

export function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const [migrating, setMigrating] = useState(false);
  
  const handleMigrate = async () => {
    setMigrating(true);
    try {
      await migrateDemoProducts();
      await fetchProducts();
      alert("Migration complete! Demo products are now in the database.");
    } catch (err) {
      console.error(err);
      alert("Migration failed.");
    } finally {
      setMigrating(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      if (!isSupabaseConfigured || !supabase) return;
      let { data, error } = await supabase
        .from('products')
        .select('*, product_images(image_url)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      if (!data || data.length === 0) {
        // Automatically migrate if empty
        console.log("No products found, starting automatic migration...");
        setMigrating(true);
        const success = await migrateDemoProducts();
        setMigrating(false);
        
        if (success) {
          // fetch again
          const retry = await supabase
            .from('products')
            .select('*, product_images(image_url)')
            .order('created_at', { ascending: false });
          data = retry.data;
        }
      }

      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your product catalog</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[var(--color-brand-dark)] text-white font-bold tracking-widest uppercase text-xs rounded-xl hover:bg-[#152e22] transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-dark)] outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Box className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">No products found</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-6 font-medium">Product</th>
                  <th className="p-6 font-medium">Status</th>
                  <th className="p-6 font-medium">Price</th>
                  <th className="p-6 font-medium">Stock</th>
                  <th className="p-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                          {product.product_images?.[0]?.image_url ? (
                            <img src={product.product_images[0].image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{product.sku || 'No SKU'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {product.status || 'Draft'}
                      </span>
                    </td>
                    <td className="p-6 font-medium text-gray-900">
                      ৳ {product.price?.toLocaleString()}
                    </td>
                    <td className="p-6">
                      <span className={`font-medium ${product.stock_quantity > 0 ? 'text-gray-900' : 'text-red-500'}`}>
                        {product.stock_quantity || 0}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
