import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

export function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer: number;
    if (!loading && user && !isSuperAdmin) {
      timer = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading, user, isSuperAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium tracking-widest text-sm uppercase">Verifying Access...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to hidden login if not logged in
    return <Navigate to="/edakpion-control-panel" state={{ from: location }} replace />;
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">403 Access Denied</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          You do not have permission to access this area. This incident has been logged.
        </p>
        <p className="text-sm font-medium text-gray-500">
          Redirecting to homepage in {countdown} seconds...
        </p>
      </div>
    );
  }

  // Also add meta tags dynamically so no search engine indexes admin pages
  return (
    <>
      <meta name="robots" content="noindex,nofollow" />
      {children}
    </>
  );
}
