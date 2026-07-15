import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import { Search, User, Shield, ShieldAlert, Trash2, Mail, PowerOff, Loader2, Download, CheckCircle, XCircle, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

type SortField = 'full_name' | 'created_at' | 'total_orders' | 'total_spend';
type SortOrder = 'asc' | 'desc';

export default function UsersManage() {
  const { profile: currentAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 1. Fetch profiles with their orders count and total amounts
      let query = supabase.from('profiles').select('*, orders(id, total)').order('created_at', { ascending: false });
      if (filterRole !== 'all') {
        query = query.eq('role', filterRole);
      }
      const { data: profiles, error } = await query;
      if (error) throw error;
      
      let mergedUsers = (profiles || []).map(p => {
        // Calculate totals from joined orders
        const orders = p.orders || [];
        const totalOrders = orders.length;
        const totalSpend = orders.reduce((sum: number, order: any) => sum + (Number(order.total) || 0), 0);
        
        return {
          ...p,
          total_orders: totalOrders,
          total_spend: totalSpend,
          is_active: p.is_active !== false, // Default to true if undefined
        };
      });
      
      // 2. Fetch auth data (emails, etc) using the secure view (works for super_admin)
      if (currentAdmin?.role === 'super_admin' || currentAdmin?.role === 'admin') {
         const { data: authUsers, error: authError } = await supabase.from('admin_auth_users').select('id, email, raw_user_meta_data, email_confirmed_at, last_sign_in_at');
         if (!authError && authUsers && authUsers.length > 0) {
            mergedUsers = mergedUsers.map(profile => {
               const authUser = authUsers.find(u => u.id === profile.id);
               return {
                  ...profile,
                  email: authUser?.email || profile.email, // Use profile.email as fallback if we had added it
                  full_name: profile.full_name || authUser?.raw_user_meta_data?.full_name || null,
                  email_confirmed_at: authUser?.email_confirmed_at,
                  last_sign_in_at: authUser?.last_sign_in_at,
               };
            });
         }
      }
      
      setUsers(mergedUsers);
      setCurrentPage(1); // Reset page on fetch
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
    try {
      // Assuming 'is_active' is added to profiles or handled locally for now
      // This might throw if is_active column doesn't exist, we should gracefully handle
      const { error } = await supabase.from('profiles').update({ is_active: !currentStatus }).eq('id', userId);
      if (error) {
        console.warn('Could not update is_active in DB. Please ensure the column exists.', error);
        alert('Could not update status. Check database schema.');
        return;
      }
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
    } catch (err: any) {
      alert(`Error toggling status: ${err.message}`);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('WARNING: Are you sure you want to delete this user profile? This action is irreversible.')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(`Error deleting user: ${err.message}`);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Joined', 'Last Login', 'Total Orders', 'Total Spend', 'Status'];
    const rows = sortedUsers.map(u => [
      u.id, 
      u.full_name || 'No Name', 
      u.email || 'Hidden', 
      u.role, 
      new Date(u.created_at).toLocaleDateString(),
      u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'Never',
      u.total_orders,
      `$${u.total_spend.toFixed(2)}`,
      u.is_active ? 'Active' : 'Disabled'
    ]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "users_export.csv";
    link.click();
  };

  // --- Filtering & Sorting ---

  const filteredUsers = users.filter(user => {
    const term = search.toLowerCase();
    const matchName = user.full_name ? user.full_name.toLowerCase().includes(term) : false;
    const matchEmail = user.email ? user.email.toLowerCase().includes(term) : false;
    const matchesSearch = term === '' || matchName || matchEmail;
    
    const matchesStatus = filterStatus === 'all' 
      ? true 
      : filterStatus === 'active' ? user.is_active : !user.is_active;

    return matchesSearch && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (valA === null || valA === undefined) valA = '';
    if (valB === null || valB === undefined) valB = '';

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB as string).toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // --- Pagination ---
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0F3D2E]">User Management</h1>
        <button onClick={exportCSV} className="bg-white border border-[#E8E4DE] text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E8E4DE] shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
          />
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {/* Status Filter */}
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 border border-[#E8E4DE] focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
          </select>

          {/* Role Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            {['all', 'user', 'manager', 'admin', 'super_admin'].map(role => (
              <button 
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors whitespace-nowrap ${
                  filterRole === role ? 'bg-[#0F3D2E] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-[#E8E4DE]'
                }`}
              >
                {role.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E4DE] shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0F3D2E] mb-2" />
            <p className="text-gray-500 text-sm">Loading users...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-[#E8E4DE]">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('full_name')}>
                      <div className="flex items-center gap-1">User <ArrowUpDown className="w-3 h-3 text-gray-400" /></div>
                    </th>
                    <th className="px-6 py-4 font-bold text-gray-700">Role</th>
                    <th className="px-6 py-4 font-bold text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('created_at')}>
                      <div className="flex items-center gap-1">Joined <ArrowUpDown className="w-3 h-3 text-gray-400" /></div>
                    </th>
                    <th className="px-6 py-4 font-bold text-gray-700 cursor-pointer hover:bg-gray-100 text-right" onClick={() => toggleSort('total_orders')}>
                      <div className="flex items-center justify-end gap-1">Orders <ArrowUpDown className="w-3 h-3 text-gray-400" /></div>
                    </th>
                    <th className="px-6 py-4 font-bold text-gray-700 cursor-pointer hover:bg-gray-100 text-right" onClick={() => toggleSort('total_spend')}>
                      <div className="flex items-center justify-end gap-1">Spend <ArrowUpDown className="w-3 h-3 text-gray-400" /></div>
                    </th>
                    <th className="px-6 py-4 font-bold text-gray-700">Status</th>
                    <th className="px-6 py-4 font-bold text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DE]">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0 border border-gray-200">
                            {user.avatar_url ? (
                              <img loading="lazy" decoding="async" src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-[#0F3D2E]">{user.full_name || 'No Name'}</p>
                            <p className="text-xs text-gray-500">{user.email || <span className="italic text-gray-400">Hidden/Unknown</span>}</p>
                            {user.email_confirmed_at && (
                               <p className="text-[10px] text-green-600 font-medium">Verified</p>
                            )}
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
                            disabled={currentAdmin?.role !== 'super_admin' && user.role === 'super_admin'}
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
                            {currentAdmin?.role === 'super_admin' && (
                               <option value="super_admin">Super Admin</option>
                            )}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        <div className="flex flex-col">
                           <span>{formatDate(user.created_at)}</span>
                           {user.last_sign_in_at && (
                              <span className="text-[10px] text-gray-400 mt-0.5">Last login: {new Date(user.last_sign_in_at).toLocaleDateString()}</span>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-700">
                        {user.total_orders}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-[#0F3D2E]">
                        ${user.total_spend.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleStatus(user.id, user.is_active !== false)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-colors ${
                            user.is_active !== false ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {user.is_active !== false ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {user.is_active !== false ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Send Password Reset">
                            <Mail className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Force Logout">
                            <PowerOff className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Data (GDPR)">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                           <User className="w-8 h-8 text-gray-300 mb-2" />
                           <p>No users found matching your criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-[#E8E4DE] flex items-center justify-between bg-gray-50/50">
                <span className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedUsers.length)} of {sortedUsers.length} users
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md text-sm font-medium border border-[#E8E4DE] bg-white disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1 px-2">
                     {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 rounded-md text-sm font-medium flex items-center justify-center ${
                             currentPage === i + 1 ? 'bg-[#0F3D2E] text-white' : 'bg-white border border-[#E8E4DE] text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                           {i + 1}
                        </button>
                     ))}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md text-sm font-medium border border-[#E8E4DE] bg-white disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
