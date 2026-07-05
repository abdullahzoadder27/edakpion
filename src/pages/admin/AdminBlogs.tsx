import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Blog } from '../../types';

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setBlogs(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      alert('Blog deleted successfully');
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert('Failed to delete blog');
    }
  };

  const handleToggleStatus = async (blog: Blog) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ 
          status: newStatus,
          published_at: newStatus === 'published' && !blog.published_at ? new Date().toISOString() : blog.published_at
        })
        .eq('id', blog.id);
        
      if (error) throw error;
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif text-[#0F3D2E]">Manage Blogs</h1>
        <Link 
          to="/admin/blogs/new" 
          className="bg-[#0F3D2E] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#154636] transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Blog
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : blogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No blog posts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 line-clamp-1">{blog.title}</div>
                      <div className="text-xs text-gray-500">{blog.slug}</div>
                    </td>
                    <td className="px-6 py-4">{blog.category || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                        blog.status === 'published' ? 'bg-green-100 text-green-800' : 
                        blog.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        {blog.status === 'published' && (
                          <Link 
                            to={`/blog/${blog.slug}`} 
                            target="_blank"
                            className="text-gray-400 hover:text-[#0F3D2E] transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleToggleStatus(blog)}
                          className="text-xs font-medium text-gray-500 hover:text-[#0F3D2E]"
                        >
                          {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <Link 
                          to={`/admin/blogs/${blog.id}/edit`}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(blog.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
