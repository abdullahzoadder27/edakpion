import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Signup() {
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        }
      });

      if (error) {
        if (error.status === 429 || error.message.toLowerCase().includes('rate limit')) {
          throw new Error('Supabase email rate limit exceeded. Please configure a custom SMTP server in your Supabase Dashboard or increase the rate limit to allow more signups from this IP address.');
        }
        throw error;
      }
      
      if (data?.user && data?.user?.identities && data.user.identities.length === 0) {
         throw new Error('This email is already registered. Please sign in instead.');
      }
      
      alert('Signup successful! Please check your email to verify your account before logging in.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F2ED] min-h-[80vh] flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E8E4DE] w-full max-w-md">
        <h1 className="text-3xl font-serif text-center mb-2 text-[#0F3D2E]">CREATE ACCOUNT</h1>
        <p className="text-center text-gray-500 mb-8 font-light">Join EDAKPION today</p>

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
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0F3D2E] text-white py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-[#154636] transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-[#0F3D2E] font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

