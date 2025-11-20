import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.verify();
      if (response.valid) {
        setUser(response.user);
        setToken(storedToken);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Only logout on auth errors, not network errors
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);

      if (response.token) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, error: 'No token received' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);

      if (response.token) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, error: 'No token received' };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed'
      };
    }
  };

  const refreshUser = async () => {
    await checkAuth();
    return user;
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

