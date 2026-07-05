import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Shield, User, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Profile {
  id: string;
  full_name: string | null;
  email?: string; // from auth.users if available, or we might not have it directly
  phone: string | null;
  role: string;
  status?: string; // we'll default to active
}

export default function SettingsManage() {
  const { profile: currentAdmin } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUsers();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) throw error;
      
      // In a real app we might join with auth.users to get email if possible,
      // but standard Supabase doesn't allow querying auth.users from client.
      // So we map what we have.
      const profiles = (data || []).map(p => ({
        ...p,
        email: p.email || 'Email hidden for privacy',
        status: 'Active'
      }));
      
      setUsers(profiles);
      
      const currentSuper = profiles.find(p => p.role === 'admin');
      if (currentSuper) {
        setSelectedUser(currentSuper);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (user.phone?.toLowerCase() || '').includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase());
      
    const matchesRole = filterRole === 'all' || 
                       (filterRole === 'admin' && user.role === 'admin') ||
                       (filterRole === 'user' && user.role !== 'admin');
                       
    return matchesSearch && matchesRole;
  });

  const handleAssignSuperAdmin = async (user: Profile) => {
    if (user.role === 'admin') return;
    
    setActionLoading(true);
    setMessage({ text: '', type: '' });
    setIsOpen(false);
    
    try {
      // Find current admins and demote them
      const currentAdmins = users.filter(u => u.role === 'admin' && u.id !== user.id);
      
      for (const admin of currentAdmins) {
        await supabase.from('profiles').update({ role: 'user' }).eq('id', admin.id);
      }
      
      // Promote new admin
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Log audit
      try {
        await supabase.from('audit_logs').insert([{
          actor_id: currentAdmin?.id,
          action: 'ASSIGN_SUPER_ADMIN',
          details: { assigned_user_id: user.id }
        }]);
      } catch (e) {
        console.warn('Audit log failed:', e);
      }
      
      setMessage({ text: `Successfully assigned ${user.full_name || 'User'} as Super Admin.`, type: 'success' });
      setSelectedUser(user);
      
      // Update local state
      setUsers(users.map(u => ({
        ...u,
        role: u.id === user.id ? 'admin' : (u.role === 'admin' ? 'user' : u.role)
      })));
      
    } catch (err: any) {
      console.error('Error assigning admin:', err);
      setMessage({ text: err.message || 'Failed to assign Super Admin.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-[#0F3D2E]">Platform Settings</h1>
      
      <div className="bg-white rounded-2xl border border-[#E8E4DE] shadow-sm overflow-visible">
        <div className="p-6 border-b border-[#E8E4DE]">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-bold text-[#0F3D2E]">Super Admin Management</h2>
          </div>
          <p className="text-sm text-gray-500">
            Select a user to grant Super Admin privileges. This will replace the current Super Admin.
          </p>
        </div>
        
        <div className="p-6 space-y-6 overflow-visible">
          {message.text && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="font-medium text-sm">{message.text}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Current Super Admin</label>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-[#0F3D2E]">{selectedUser?.full_name || 'No Admin Assigned'}</p>
                <p className="text-xs text-gray-500">{selectedUser?.email} • ID: {selectedUser?.id}</p>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                  Super Admin
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="block text-sm font-bold text-gray-700">Assign New Super Admin</label>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-white border border-[#E8E4DE] rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-600">Select a user from the directory...</span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
            
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E8E4DE] rounded-xl shadow-xl z-50 max-h-[400px] flex flex-col">
                <div className="p-4 border-b border-[#E8E4DE] space-y-3">
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, or ID..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['all', 'user', 'admin'].map(role => (
                      <button
                        key={role}
                        onClick={() => setFilterRole(role)}
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-colors ${
                          filterRole === role 
                            ? 'bg-[#0F3D2E] text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading users...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No users found matching your search.</div>
                  ) : (
                    filteredUsers.map(user => (
                      <div 
                        key={user.id}
                        className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-[#E8E4DE] flex items-center justify-between group"
                        onClick={() => handleAssignSuperAdmin(user)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-[#0F3D2E] text-sm">{user.full_name || 'Unnamed User'}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex gap-2">
                            {user.status === 'Active' && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">Active</span>
                            )}
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : 'User'}
                            </span>
                          </div>
                          {user.role !== 'admin' && (
                            <span className="text-xs text-purple-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              Assign →
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
