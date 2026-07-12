import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

interface Employee {
  id: number;
  employeeCode: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  departmentId?: number | null;
  department?: { id: number; name: string } | null;
  status: string;
  profilePhoto?: string;
}

interface User {
  id: number;
  email: string;
  role: 'Admin' | 'Asset Manager' | 'Department Head' | 'Employee';
  employee?: Employee | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, departmentId?: number) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('nexasset_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await api.get('/me');
          setUser(res.data.user);
        } catch (error) {
          console.error('Failed to restore authentication session:', error);
          localStorage.removeItem('nexasset_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      
      localStorage.setItem('nexasset_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, departmentId?: number) => {
    setLoading(true);
    try {
      const res = await api.post('/signup', { name, email, password, departmentId });
      const { token: receivedToken, user: receivedUser } = res.data;
      
      localStorage.setItem('nexasset_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.post('/logout').catch(() => {});
    localStorage.removeItem('nexasset_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/me');
      setUser(res.data.user);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
