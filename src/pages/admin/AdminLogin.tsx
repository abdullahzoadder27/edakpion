import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Lock, Mail, Key } from 'lucide-react';

export function AdminLogin() {
  const { user, loading, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Add noindex to the hidden login
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If already logged in and is super admin, redirect to dashboard
  if (user && isSuperAdmin) {
    return <Navigate to="/edakpion-control-panel/dashboard" replace />;
  }

  // If logged in but not super admin, they shouldn't really be here, 
  // maybe we redirect them to home, or let them see access denied via another route,
  // but if they just land on the login page, we can redirect to home or show an error.
  if (user && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setError('System configuration error.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // The auth context will pick up the session and update the state.
      // But we can also manually check if they are admin to log the attempt.
      
      // Let's log the attempt (we can do it after sign in or even on fail if we tracked email)
      // For now, rely on Supabase Auth.
      
      navigate('/edakpion-control-panel/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      
      // Log failed attempt
      if (supabase) {
        supabase.from('login_attempts').insert([
          { email_attempted: email, success: false, ip_address: 'unknown', user_agent: navigator.userAgent }
        ]).then((res) => { if (res.error) console.error(res.error); });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gray-900 border-b border-gray-800 p-8 text-center relative overflow-hidden">
          {/* Abstract secure background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700 shadow-lg">
              <Lock className="w-8 h-8 text-gray-300" />
            </div>
            <h1 className="text-2xl font-bold tracking-widest text-white uppercase">Control Panel</h1>
            <p className="text-gray-400 text-sm mt-2">Restricted Access Area</p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none"
                  placeholder="admin@edakpion.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Secure Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold uppercase tracking-widest text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Authenticate'
              )}
            </button>
          </form>
        </div>
      </div>
      
      <p className="mt-8 text-gray-500 text-xs text-center max-w-sm">
        Warning: Unauthorized access to this system is strictly prohibited and will be prosecuted to the full extent of the law. All activities are monitored and logged.
      </p>
    </div>
  );
}
