import { useEffect, useState } from 'react';
import { supabase, isMockData } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'guest' | 'user' | 'admin'>('guest');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    const fetchSession = async () => {
      try {
        if (isMockData) {
          const mockUserStr = localStorage.getItem('mock_user');
          if (mockUserStr) {
            const mockUser = JSON.parse(mockUserStr);
            setUser({ id: 'mock-id', email: mockUser.email });
            setProfile({
              id: 'mock-id',
              full_name: mockUser.email.includes('admin') ? 'System Admin' : 'Test User',
              phone: null,
              avatar_url: null,
              role: mockUser.role,
              created_at: new Date().toISOString()
            });
            setRole(mockUser.role);
          } else {
            setUser(null);
            setProfile(null);
            setRole('guest');
          }
          setIsLoading(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setUser(null);
          setProfile(null);
          setRole('guest');
        }
      } catch (err) {
        // console.error('Error fetching session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // Custom event listener for mock auth changes
    const handleAuthChange = () => {
      if (isMockData) {
        setIsLoading(true);
        fetchSession();
      }
    };
    window.addEventListener('auth_change', handleAuthChange);

    // Listen for auth changes
    let subscription: any;
    if (!isMockData) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setIsLoading(true);
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setUser(null);
          setProfile(null);
          setRole('guest');
        }
        setIsLoading(false);
      });
      subscription = data.subscription;
    }

    return () => {
      window.removeEventListener('auth_change', handleAuthChange);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        // Fallback for users without a profile (e.g. no trigger set up)
        setProfile({
          id: userId,
          full_name: email?.split('@')[0] || 'User',
          phone: null,
          avatar_url: null,
          role: 'user',
          created_at: new Date().toISOString()
        });
        setRole('user');
        return;
      }
      
      if (data) {
        setProfile((data as UserProfile));
        setRole(data.role || 'user');
      }
    } catch (err) {
      // console.error('Error fetching profile:', err);
    }
  };

  const signOut = async () => {
    try {
      if (isMockData) {
        localStorage.removeItem('mock_user');
        window.dispatchEvent(new Event('auth_change'));
        setUser(null);
        setProfile(null);
        setRole('guest');
        navigate('/login');
        return;
      }

      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setRole('guest');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    profile,
    role,
    isLoading,
    isLoggedIn: role !== 'guest',
    isAdmin: role === 'admin',
    signOut
  };
}
