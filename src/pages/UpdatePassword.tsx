import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Will be populated if token is valid
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F2ED] min-h-[80vh] flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E8E4DE] w-full max-w-md">
        <h1 className="text-3xl font-serif text-center mb-2 text-[#0F3D2E]">SET NEW PASSWORD</h1>
        <p className="text-center text-gray-500 mb-8 font-light">Enter your new password below</p>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm text-center">
            Password updated successfully! Redirecting to login...
            <div className="mt-4">
              <Link to="/login" className="text-[#0F3D2E] font-bold hover:underline">Click here if not redirected</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#0F3D2E] mb-1">New Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                minLength={6}
                className="w-full border border-[#E8E4DE] rounded-xl p-3 outline-none focus:border-[#0F3D2E]" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0F3D2E] text-white py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-[#154636] transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
