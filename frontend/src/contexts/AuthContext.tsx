import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { message } from 'antd';
import api from '../services/api';
import { USE_MOCK_API } from '../hooks/useApi';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        if (USE_MOCK_API) {
          // For mock token
          const decoded = JSON.parse(atob(token));
          setUser(decoded.user);
        } else {
          // For real JWT token
          const decoded = jwtDecode<{ userId: string; email: string; firstName: string; lastName: string }>(token);
          setUser({
            id: decoded.userId,
            name: `${decoded.firstName} ${decoded.lastName}`,
            email: decoded.email
          });
        }
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Import dynamically to avoid circular dependency
      const { currentApi } = await import('../hooks/useApi');
      const { token } = await currentApi.login(email, password);
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (USE_MOCK_API) {
        // For mock token
        const decoded = JSON.parse(atob(token));
        setUser(decoded.user);
      } else {
        // For real JWT token
        const decoded = jwtDecode<{ userId: string; email: string; firstName: string; lastName: string }>(token);
        setUser({
          id: decoded.userId,
          name: `${decoded.firstName} ${decoded.lastName}`,
          email: decoded.email
        });
      }
      
      message.success('Login successful');
    } catch (error) {
      console.error('Login failed', error);
      message.error('Invalid email or password');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    message.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};