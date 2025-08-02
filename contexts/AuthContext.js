"use client"

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check for existing token in localStorage only on client side
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('AuthContext: Checking localStorage');
      console.log('Stored token:', storedToken ? 'exists' : 'not found');
      console.log('Stored user:', storedUser ? 'exists' : 'not found');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('AuthContext: Restored from localStorage');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login for:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('AuthContext: Login response status:', response.status);
      console.log('AuthContext: Login response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      setToken(data.token);
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      console.log('AuthContext: Login successful, token stored');
      console.log('AuthContext: Token length:', data.token?.length);

      return { success: true };
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out');
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const isAuthenticated = () => {
    const authenticated = !!user && !!token;
    console.log('AuthContext: isAuthenticated check:', authenticated);
    console.log('AuthContext: user exists:', !!user);
    console.log('AuthContext: token exists:', !!token);
    return authenticated;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isEmployee = () => {
    return user?.role === 'employee';
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isEmployee,
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    </div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 