import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isMockData } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isMockData) {
        if (email === 'admin@edakpion.com' && password === 'admin123') {
           localStorage.setItem('mock_user', JSON.stringify({ email, role: 'admin' }));
           window.dispatchEvent(new Event('auth_change'));
           navigate('/admin');
        } else {
           localStorage.setItem('mock_user', JSON.stringify({ email, role: 'user' }));
           window.dispatchEvent(new Event('auth_change'));
           navigate('/account');
        }
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F2ED] min-h-[80vh] flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E8E4DE] w-full max-w-md">
        <h1 className="text-3xl font-serif text-center mb-2 text-[#0F3D2E]">WELCOME BACK</h1>
        <p className="text-center text-gray-500 mb-8 font-light">Sign in to your account</p>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#0F3D2E] mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="w-full border border-[#E8E4DE] rounded-xl p-3 outline-none focus:border-[#0F3D2E]" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F3D2E] mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="w-full border border-[#E8E4DE] rounded-xl p-3 outline-none focus:border-[#0F3D2E]" 
            />
          </div>
          <div className="flex justify-end">
            <button type="button" className="text-sm text-[#0F3D2E] font-medium hover:underline">Forgot password?</button>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0F3D2E] text-white py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-[#154636] transition-colors disabled:opacity-50"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Don't have an account? <Link to="/signup" className="text-[#0F3D2E] font-bold hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

