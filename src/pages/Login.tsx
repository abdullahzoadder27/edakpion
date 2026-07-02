import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import React from 'react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/profile';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen font-sans antialiased flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="w-full max-w-md premium-card p-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-[var(--color-brand-dark)]">Welcome Back</h1>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
          
          <form onSubmit={handleLogin} className="space-y-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-3 premium-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" /> Remember Me
              </label>
              <Link to="/forgot-password" className="text-[var(--color-brand-dark)] hover:underline">Forgot Password?</Link>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[var(--color-brand-dark)] text-white py-3 premium-button font-bold tracking-widest hover:bg-[#152e22] disabled:opacity-70"
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account? <Link to="/signup" className="text-[var(--color-brand-dark)] font-bold hover:underline">Sign up</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
