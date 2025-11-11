import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await authAPI.verify();
          if (response.valid) {
            setUser(response.user);
            setToken(storedToken);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // Clear token if it's an auth error (expired, invalid, etc.)
          // But keep it if it's just a network error
          const isAuthError = error.message && (
            error.message.includes('expired') ||
            error.message.includes('invalid') ||
            error.message.includes('Invalid token') ||
            error.message.includes('Token expired') ||
            error.message.includes('Authentication')
          );
          
          if (isAuthError || (error.message && !error.message.includes('connect to server'))) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      
      // Store token first
      if (response.token) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
      }
      
      // Set user data from login response
      if (response.user) {
        setUser(response.user);
      }
      
      // Verify the token to get fresh user data (including hostId/driverId)
      // This ensures we have the latest data from the database
      if (response.token) {
        try {
          const verifyResponse = await authAPI.verify();
          if (verifyResponse && verifyResponse.valid && verifyResponse.user) {
            setUser(verifyResponse.user);
            return { success: true, user: verifyResponse.user };
          }
        } catch (verifyError) {
          console.warn('Token verification after login failed:', verifyError);
          // If verify fails but we have user data from login, use that
          if (response.user) {
            return { success: true, user: response.user };
          }
          // If verify fails and no user data, fail the login
          throw new Error('Login succeeded but token verification failed. Please try again.');
        }
      }
      
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      // Store token first
      if (response.token) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
      }
      
      // Set user data from registration response
      if (response.user) {
        setUser(response.user);
      }
      
      // Verify the token to get fresh user data (including hostId/driverId)
      // This ensures we have the latest data from the database
      if (response.token) {
        try {
          // Small delay to ensure token is stored
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const verifyResponse = await authAPI.verify();
          if (verifyResponse && verifyResponse.valid && verifyResponse.user) {
            setUser(verifyResponse.user);
            return { success: true, user: verifyResponse.user };
          }
        } catch (verifyError) {
          console.error('Token verification after registration failed:', verifyError);
          // If verify fails but we have user data from registration, use that
          if (response.user) {
            console.warn('Using user data from registration response instead of verified data');
            return { success: true, user: response.user };
          }
          // If verify fails and no user data, fail the registration
          throw new Error('Registration succeeded but token verification failed. Please try logging in.');
        }
      }
      
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Function to refresh user data
  const refreshUser = async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const response = await authAPI.verify();
        if (response.valid) {
          setUser(response.user);
          return response.user;
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          return null;
        }
      } catch (error) {
        console.error('Failed to refresh user:', error);
        // Clear token if it's an auth error
        const isAuthError = error.message && (
          error.message.includes('expired') ||
          error.message.includes('invalid') ||
          error.message.includes('Invalid token') ||
          error.message.includes('Token expired') ||
          error.message.includes('Authentication')
        );
        
        if (isAuthError || (error.message && !error.message.includes('connect to server'))) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
        return null;
      }
    }
    return null;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

