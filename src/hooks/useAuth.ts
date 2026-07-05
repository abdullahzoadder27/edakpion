import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | string;
  admin_role?: string;
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
        console.error('Error fetching session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      // First try to fetch from admins table to see if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*, roles(role_name)')
        .eq('auth_user_id', userId)
        .eq('is_active', true)
        .single();

      if (!adminError && adminData) {
        setProfile({
          id: userId,
          full_name: adminData.full_name || email?.split('@')[0] || 'Admin',
          phone: null,
          avatar_url: null,
          role: 'admin',
          admin_role: adminData.roles?.role_name || 'Admin',
          created_at: adminData.created_at || new Date().toISOString()
        });
        setRole('admin');
        return;
      }

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
