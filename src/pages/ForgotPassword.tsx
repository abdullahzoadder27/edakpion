import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset instructions have been sent to your email.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen font-sans antialiased flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="w-full max-w-md premium-card p-8">
          <h1 className="text-3xl font-bold mb-2 text-center text-[var(--color-brand-dark)]">Reset Password</h1>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
          {message && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-xl">{message}</div>}
          
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 premium-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[var(--color-brand-dark)] text-white py-3 premium-button font-bold tracking-widest hover:bg-[#152e22] disabled:opacity-70"
            >
              {loading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600 flex flex-col gap-2">
            <div>
              Remember your password? <Link to="/login" className="text-[var(--color-brand-dark)] font-bold hover:underline">Log in</Link>
            </div>
            <div>
              Don't have an account? <Link to="/signup" className="text-[var(--color-brand-dark)] font-bold hover:underline">Sign up</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
