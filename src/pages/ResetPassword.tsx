import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase will automatically handle the #access_token in the URL
    // We just need to check if we have a session
    supabase?.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // If there is no session, the link might be invalid or expired
        setError('Invalid or expired password reset link. Please try requesting a new one.');
      }
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Password updated successfully
      alert('Password has been updated successfully!');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen font-sans antialiased flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="w-full max-w-md premium-card p-8">
          <h1 className="text-3xl font-bold mb-2 text-center text-[var(--color-brand-dark)]">Update Password</h1>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Enter your new password below.
          </p>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input 
                type="password" 
                required
                minLength={6}
                className="w-full px-4 py-3 premium-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !!error}
              className="w-full bg-[var(--color-brand-dark)] text-white py-3 premium-button font-bold tracking-widest hover:bg-[#152e22] disabled:opacity-70"
            >
              {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
