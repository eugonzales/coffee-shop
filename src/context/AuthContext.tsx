import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { getProfile, sendPasswordReset } from '../services/shopData';
import { getSupabase } from '../lib/supabase';

interface AuthContextType extends AuthState {
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateUser: (user: User) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unable to restore your Supabase session.';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = getSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT' && active) {
        setAuthState({ user: null, isAuthenticated: false });
      }
    });

    void supabase.auth.getSession()
      .then(async ({ data, error }) => {
        if (error) throw error;
        if (!data.session) return;

        const profile = await getProfile(data.session.user.id);
        if (!profile.isActive) {
          await supabase.auth.signOut();
          return;
        }
        if (active) setAuthState({ user: profile, isAuthenticated: true });
      })
      .catch(error => {
        if (active) setAuthError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    if (!data.user) throw new Error('Supabase did not return a signed-in user.');

    const profile = await getProfile(data.user.id);
    if (!profile.isActive) {
      await supabase.auth.signOut();
      throw new Error('This account has been disabled. Contact the shop for help.');
    }
    setAuthState({ user: profile, isAuthenticated: true });
    setAuthError(null);
  };

  const logout = async () => {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
    setAuthState({ user: null, isAuthenticated: false });
  };

  const register = async (email: string, password: string, name: string) => {
    const { data, error } = await getSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (error) throw error;
    if (!data.session) return true;
    if (!data.user) throw new Error('Supabase did not return a registered user.');

    const profile = await getProfile(data.user.id);
    setAuthState({ user: profile, isAuthenticated: true });
    setAuthError(null);
    return false;
  };

  const requestPasswordReset = (email: string) => sendPasswordReset(email);

  const updatePassword = async (password: string) => {
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) throw error;
  };

  const updateUser = async (updatedUser: User) => {
    const currentUser = authState.user;
    if (!currentUser) throw new Error('You must be signed in to update your profile.');

    const supabase = getSupabase();
    if (updatedUser.email !== currentUser.email) {
      const { error } = await supabase.auth.updateUser({ email: updatedUser.email.trim() });
      if (error) throw error;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: updatedUser.name.trim(),
        address: updatedUser.address || null,
        phone: updatedUser.phone || null,
        location_latitude: updatedUser.location?.latitude ?? null,
        location_longitude: updatedUser.location?.longitude ?? null,
        favorite_items: updatedUser.favoriteItems,
      })
      .eq('id', currentUser.id);
    if (error) throw error;

    const profile = await getProfile(currentUser.id);
    setAuthState({ user: profile, isAuthenticated: true });
    return profile;
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        isLoading,
        authError,
        login,
        logout,
        register,
        requestPasswordReset,
        updatePassword,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
