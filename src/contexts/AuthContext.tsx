"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'USER' | 'ADMIN';
  status?: string;
  joinDate?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
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
        }
      }
    } catch (error) {
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
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    logout,
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