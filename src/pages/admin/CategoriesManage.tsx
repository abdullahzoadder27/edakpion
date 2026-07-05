import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function CategoriesManage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      // console.warn('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const slug = newName.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');
      const { data, error } = await supabase.from('categories').insert([{ name: newName, slug }]).select().single();
      if (error) throw error;
      setCategories([...categories, data]);
      setNewName('');
    } catch (err: any) {
      console.warn('Error adding category:', err);
      if (err.code === '42501') {
        alert("Database Permission Denied (RLS): Your user does not have admin role in the database. Please create a new account with 'admin' in the email, or run an SQL update in Supabase to set your role to 'admin'.");
      } else {
        alert(`Failed to add category: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleEdit = (category: any) => {
    setIsEditing(category.id);
    setEditName(category.name);
    setEditSlug(category.slug);
  };

  const handleUpdate = async (id: string) => {
    try {
      const { data, error } = await supabase.from('categories').update({ name: editName, slug: editSlug }).eq('id', id).select().single();
      if (error) throw error;
      setCategories(categories.map(c => c.id === id ? data : c));
      setIsEditing(null);
    } catch (err) {
      console.warn('Error updating category:', err);
      alert('Failed to update category');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      console.warn('Error deleting category:', err);
      alert('Failed to delete category (might be in use by products)');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F3D2E]">Categories</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm space-y-4">
            <h3 className="font-bold text-[#0F3D2E]">Add New Category</h3>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Category Name</label>
              <input 
                type="text" required
                value={newName} onChange={e => setNewName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                placeholder="e.g. Summer Collection"
              />
            </div>
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#0F3D2E] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#154636] transition-colors"
            >
              <Plus className="w-5 h-5" /> Add
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-[#E8E4DE] overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F2ED] text-[#0F3D2E]">
                <tr>
                  <th className="px-6 py-4 font-bold">Name</th>
                  <th className="px-6 py-4 font-bold">Slug</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DE]">
                {loading ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No categories found.</td></tr>
                ) : (
                  categories.map(category => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {isEditing === category.id ? (
                          <input 
                            type="text" 
                            value={editName} onChange={e => setEditName(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-[#E8E4DE] rounded"
                          />
                        ) : (
                          <span className="font-bold text-[#0F3D2E]">{category.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing === category.id ? (
                          <input 
                            type="text" 
                            value={editSlug} onChange={e => setEditSlug(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-[#E8E4DE] rounded"
                          />
                        ) : (
                          <span className="text-gray-500 font-mono text-xs">{category.slug}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isEditing === category.id ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setIsEditing(null)} className="text-gray-500 hover:underline">Cancel</button>
                            <button onClick={() => handleUpdate(category.id)} className="text-green-600 font-bold hover:underline">Save</button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEdit(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(category.id, category.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
