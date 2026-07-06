import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F2ED] min-h-[80vh] flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E8E4DE] w-full max-w-md">
        <h1 className="text-3xl font-serif text-center mb-2 text-[#0F3D2E]">RESET PASSWORD</h1>
        <p className="text-center text-gray-500 mb-8 font-light">Enter your email to receive a reset link</p>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm text-center">
            Password reset link sent! Check your email.
            <div className="mt-4">
              <Link to="/login" className="text-[#0F3D2E] font-bold hover:underline">Back to Login</Link>
            </div>
          </div>
        ) : (
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0F3D2E] text-white py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-[#154636] transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-[#0F3D2E] font-medium hover:underline">Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
