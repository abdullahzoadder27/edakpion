import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AlertCircle } from 'lucide-react';

interface Role {
  id: string;
  role_name: string;
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRoles, setFetchingRoles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('roles')
          .select('id, role_name')
          .order('role_name');
        
        if (error) throw error;
        setRoles(data || []);
      } catch (err: any) {
        console.warn('Error fetching roles:', err.message);
        setError('Failed to load admin roles. Please check database connection.');
        setRoles([]);
      } finally {
        setFetchingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId) {
      setError('Please select a role.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error('Login failed.');

      // Check admin permissions from the 'admins' table
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*, roles(role_name)')
        .eq('auth_user_id', authData.user.id)
        .eq('is_active', true)
        .single();

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        throw new Error('Unauthorized access or account deactivated.');
      }

      if (adminData.role_id !== roleId) {
        await supabase.auth.signOut();
        throw new Error('Role mismatch. Please select your assigned role.');
      }

      // Determine dashboard based on role name
      const selectedRole = roles.find(r => r.id === roleId)?.role_name || adminData.roles?.role_name;
      
      switch(selectedRole) {
        case 'Super Admin':
        case 'Admin':
          navigate('/admin');
          break;
        case 'Manager':
          navigate('/admin/users'); // Example route
          break;
        case 'Inventory Manager':
          navigate('/admin/products');
          break;
        case 'Order Manager':
          navigate('/admin/orders');
          break;
        case 'Content Editor':
          navigate('/admin/blogs');
          break;
        case 'Customer Support':
          navigate('/admin/support');
          break;
        default:
          navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login as admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0F3D2E] min-h-screen flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-[#E8E4DE] w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-widest text-[#0F3D2E] mb-2">
            EDAKPION
          </h1>
          <p className="text-gray-500 font-medium uppercase tracking-wider text-sm">
            Admin Portal
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex gap-2 items-start border border-red-100">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#0F3D2E] mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#0F3D2E] focus:ring-1 focus:ring-[#0F3D2E]" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0F3D2E] mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#0F3D2E] focus:ring-1 focus:ring-[#0F3D2E]" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#0F3D2E] mb-1">Admin Role</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              required
              disabled={fetchingRoles}
              className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#0F3D2E] focus:ring-1 focus:ring-[#0F3D2E] bg-white disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="" disabled>Select your role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.role_name}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading || fetchingRoles}
            className="w-full bg-[#0F3D2E] text-white py-3.5 rounded-xl font-bold tracking-widest uppercase hover:bg-[#154636] transition-colors disabled:opacity-50 mt-2 shadow-md shadow-[#0F3D2E]/20"
          >
            {loading ? 'AUTHENTICATING...' : 'SECURE LOGIN'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-[#0F3D2E] font-medium transition-colors">
            &larr; Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
