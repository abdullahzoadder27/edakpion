import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../lib/store';
import { create } from 'zustand';

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | string;
  admin_role?: string;
  created_at: string;
}

interface AuthState {
  user: any | null;
  profile: UserProfile | null;
  role: 'guest' | 'user' | 'admin';
  isLoading: boolean;
  setUser: (user: any | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setRole: (role: 'guest' | 'user' | 'admin') => void;
  setIsLoading: (isLoading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  role: 'guest',
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setRole: (role) => set({ role }),
  setIsLoading: (isLoading) => set({ isLoading }),
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, profile: null, role: 'guest' });
    } catch (error) {
      console.warn('Error signing out:', error);
    }
  }
}));

// Initialize auth state outside of components so it only runs once
let isInitializing = false;

const initAuth = async () => {
  if (isInitializing) return;
  isInitializing = true;
  
  const { setUser, setProfile, setRole, setIsLoading } = useAuthStore.getState();
  
  const fetchProfile = async (userId: string, email?: string) => {
    try {
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
      // console.warn('Error fetching profile:', err);
    }
  };

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    if (session?.user) {
      setUser(session.user);
      await fetchProfile(session.user.id, session.user.email);
      useCartStore.getState().syncCart();
    } else {
      setUser(null);
      setProfile(null);
      setRole('guest');
    }
  } catch (err) {
    console.warn('Error fetching session:', err);
  } finally {
    setIsLoading(false);
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    setIsLoading(true);
    if (session?.user) {
      setUser(session.user);
      await fetchProfile(session.user.id, session.user.email);
      useCartStore.getState().syncCart();
    } else {
      setUser(null);
      setProfile(null);
      setRole('guest');
    }
    setIsLoading(false);
  });
};

initAuth();

export function useAuth() {
  const authState = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authState.signOut();
    navigate('/login');
  };

  return {
    user: authState.user,
    profile: authState.profile,
    role: authState.role,
    isLoading: authState.isLoading,
    isLoggedIn: authState.role !== 'guest',
    isAdmin: authState.role === 'admin',
    signOut: handleSignOut
  };
}
