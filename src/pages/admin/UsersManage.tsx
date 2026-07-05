import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import { Search, User, Shield, ShieldAlert, Trash2 } from 'lucide-react';

export default function UsersManage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      // console.warn('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
      if (error) throw error;
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    } catch (err) {
      console.warn('Error updating role:', err);
      alert('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
     u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[#0F3D2E]">Users</h1>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#E8E4DE] flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-[#E8E4DE] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F2ED] text-[#0F3D2E]">
              <tr>
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Joined Date</th>
                <th className="px-6 py-4 font-bold">Phone</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DE]">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-[#E8E4DE]">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#0F3D2E]">{user.full_name || 'No Name'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {user.phone || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' ? <ShieldAlert className="w-4 h-4 text-purple-600" /> : <Shield className="w-4 h-4 text-gray-400" />}
                        <select 
                          value={user.role || 'user'}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className={`text-xs font-bold px-2 py-1 rounded-full outline-none border-none ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Delete logic for users often requires Supabase Edge Functions for Auth deletion, 
                          so we might just disable them or skip full delete here */}
                      <button 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-50 cursor-not-allowed"
                        title="Delete user (Disabled in UI)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
