'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthResponse } from '../lib/types/api';
import { authService } from '../lib/services/api';
import apiClient from '../lib/api-client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthContext: Initializing authentication...')
      try {
        const token = apiClient.getToken();
        console.log('AuthContext: Found token:', !!token)
        if (token) {
          console.log('AuthContext: Token found, refreshing user...')
          await refreshUser();
        } else {
          console.log('AuthContext: No token found')
        }
      } catch (error) {
        console.error('AuthContext: Failed to initialize auth:', error);
        apiClient.setToken(null);
      } finally {
        console.log('AuthContext: Initialization complete, setting loading to false')
        setIsLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('AuthContext: Initialization timeout, forcing loading to false')
      setIsLoading(false);
    }, 10000); // 10 second timeout

    initializeAuth().finally(() => {
      clearTimeout(timeout);
    });

    return () => clearTimeout(timeout);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Attempting login for:', email)
      setIsLoading(true);
      const response = await authService.login({ email, password });
      
      if (response.success) {
        const { user: userData, token, refreshToken } = response.data;
        console.log('AuthContext: Login successful, user data:', { name: userData.name, role: userData.role, email: userData.email })
        
        // Store tokens
        apiClient.setToken(token);
        localStorage.setItem('refresh_token', refreshToken);
        console.log('AuthContext: Tokens stored successfully')
        
        // Set user
        setUser(userData);
        console.log('AuthContext: User state updated')
        return true;
      } else {
        console.log('AuthContext: Login failed - response not successful')
      }
      return false;
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      return false;
    } finally {
      console.log('AuthContext: Setting login loading to false')
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.register({ email, password, name });
      
      if (response.success) {
        const { user: userData, token, refreshToken } = response.data;
        
        // Store tokens
        apiClient.setToken(token);
        localStorage.setItem('refresh_token', refreshToken);
        
        // Set user
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout API
      await authService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state regardless of API call success
      apiClient.setToken(null);
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      console.log('AuthContext: Refreshing user profile...')
      const response = await authService.getProfile();
      if (response.success) {
        console.log('AuthContext: User profile retrieved:', { name: response.data.name, role: response.data.role, email: response.data.email })
        setUser(response.data);
      } else {
        console.log('AuthContext: Failed to get user profile - response not successful')
        throw new Error('Failed to get user profile');
      }
    } catch (error) {
      console.error('AuthContext: Failed to refresh user:', error);
      // If refresh fails, clear auth state
      apiClient.setToken(null);
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 