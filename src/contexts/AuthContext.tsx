'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { trackAuth } from "@/lib/analytics-gtm";
import { signIn } from "next-auth/react";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'USER' | 'ADMIN' | 'SALES_MANAGER' | 'CHANNEL_PARTNER';
  status?: string;
  joinDate?: string;
  territory?: string;
  commission?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSalesManager: boolean;
  isChannelPartner: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  isLoading: boolean;
  isHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Check for authentication on mount
  useEffect(() => {
    setIsHydrated(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response?.data && typeof response.data === 'object') {
        // The /auth/me endpoint returns { user }
        const responseData = response.data as { user?: User } | User;
        const userData = 'user' in responseData ? responseData.user : responseData;
        if (userData && typeof userData === 'object' && 'id' in userData) {
          setUser(userData as User);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      if (typeof console !== 'undefined' && console.error) {
        console.error("Auth check failed:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      if (response?.data && typeof response.data === 'object') {
        // The /auth/login endpoint returns { user, message, token }
        const responseData = response.data as { user?: User; message?: string; token?: string } | User;
        const userData = 'user' in responseData ? responseData.user : responseData;
        if (userData && typeof userData === 'object' && 'id' in userData) {
          setUser(userData as User);
          trackAuth('login', 'email');
          return { success: true };
        }
      }
      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      if (typeof console !== 'undefined' && console.error) {
        console.error("Login error:", error);
      }
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      if (typeof console !== 'undefined' && console.error) {
        console.error("Logout error:", error);
      }
    } finally {
      setUser(null);
      trackAuth('logout');
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signIn("google");
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isSalesManager: user?.role === 'SALES_MANAGER',
    isChannelPartner: user?.role === 'CHANNEL_PARTNER',
    login,
    logout,
    signInWithGoogle,
    isLoading,
    isHydrated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
