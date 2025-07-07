import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { getCurrentUser, saveCurrentUser, getUsers, saveUsers } from '../utils/localStorage';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  updateUser: (user: User) => void;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setAuthState({
        user,
        isAuthenticated: true,
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      setAuthState({
        user,
        isAuthenticated: true,
      });
      saveCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
    });
    saveCurrentUser(null);
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    const users = getUsers();
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      password,
      name,
      role: 'user',
      favoriteItems: [],
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);
    
    setAuthState({
      user: newUser,
      isAuthenticated: true,
    });
    saveCurrentUser(newUser);
    return true;
  };

  const updateUser = (updatedUser: User) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      saveUsers(users);
      saveCurrentUser(updatedUser);
      const freshUser = getCurrentUser();
      setAuthState({
        user: freshUser,
        isAuthenticated: true,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};