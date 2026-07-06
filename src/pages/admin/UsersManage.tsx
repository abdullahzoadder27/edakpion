import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import { Search, User, Shield, ShieldAlert, Trash2, Mail, PowerOff, Loader2, Download, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function UsersManage() {
  const { profile: currentAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase.from('profiles').select('*, admin_activity_logs(count)').order('created_at', { ascending: false });
      if (filterRole !== 'all') {
        query = query.eq('role', filterRole);
      }
      const { data, error } = await query;
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.warn('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(`Error updating role: ${err.message}`);
    }
  };

  const toggleStatus = async (userId: string, currentStatus: boolean) => {
    // We assume profiles has an 'is_active' or we can add it, or just use 'status' text
    try {
      const { error } = await supabase.from('profiles').update({ is_active: !currentStatus }).eq('id', userId);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
    } catch (err: any) {
      alert(`Error toggling status: ${err.message}`);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Joined', 'Status'];
    const rows = filteredUsers.map(u => [
      u.id, u.full_name, u.email, u.role, new Date(u.created_at).toLocaleString(), u.is_active ? 'Active' : 'Disabled'
    ]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "users_export.csv";
    link.click();
  };

  const filteredUsers = users.filter(user => 
    (user.full_name?.toLowerCase().includes(search.toLowerCase()) || '') || 
    (user.email?.toLowerCase().includes(search.toLowerCase()) || '')
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0F3D2E]">Super Admin - User Management</h1>
        <button onClick={exportCSV} className="bg-white border border-[#E8E4DE] text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-50">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E8E4DE] shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'user', 'manager', 'admin', 'super_admin'].map(role => (
            <button 
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors ${
                filterRole === role ? 'bg-[#0F3D2E] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-[#E8E4DE]'
              }`}
            >
              {role.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E4DE] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0F3D2E]" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-[#E8E4DE]">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-700">User</th>
                  <th className="px-6 py-4 font-bold text-gray-700">Role</th>
                  <th className="px-6 py-4 font-bold text-gray-700">Joined</th>
                  <th className="px-6 py-4 font-bold text-gray-700">Status</th>
                  <th className="px-6 py-4 font-bold text-gray-700">Email Actions</th>
                  <th className="px-6 py-4 font-bold text-gray-700 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DE]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                          {user.avatar_url ? (
                            <img loading="lazy" decoding="async" src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.role === 'super_admin' ? <ShieldAlert className="w-4 h-4 text-purple-600" /> : 
                         user.role === 'admin' ? <Shield className="w-4 h-4 text-blue-600" /> : 
                         <User className="w-4 h-4 text-gray-400" />}
                        <select 
                          value={user.role || 'user'}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className={`text-xs font-bold px-2 py-1 rounded-full outline-none border border-transparent hover:border-gray-200 cursor-pointer ${
                            user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 
                            user.role === 'manager' ? 'bg-green-100 text-green-700' : 
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(user.id, user.is_active !== false)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                          user.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.is_active !== false ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {user.is_active !== false ? 'Active' : 'Suspended'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Send Password Reset"><Mail className="w-4 h-4" /></button>
                        <button className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg" title="Force Logout"><PowerOff className="w-4 h-4" /></button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Data (GDPR)">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
