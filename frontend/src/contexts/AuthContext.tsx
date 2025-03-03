import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api, { realApi } from '../services/api';

interface UIUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: UIUser | null;
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
  const [user, setUser] = useState<UIUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token) {
      try {
        // For real JWT token
        const decoded = jwtDecode<{ 
          userId: string; 
          email: string; 
          role: string; 
          exp?: number;
          iat?: number;
        }>(token);

        // Set authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user info from localStorage if available
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          // Fallback if token exists but user data is missing
          setUser({
            id: decoded.userId,
            name: 'User', // Generic fallback name
            email: decoded.email
          });
          setIsAuthenticated(true);
          
          // Recreate user in localStorage for future use
          localStorage.setItem('user', JSON.stringify({
            id: decoded.userId,
            name: 'User',
            email: decoded.email
          }));
        }
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const {  token, user } = await realApi.login(email, password);
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Store user info in localStorage (only non-sensitive data)
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        name: user.firstName,
        email: user.email
      }));
      
      // Set user in state
      setUser({
        id: user.id ?? '',
        name: user.firstName,
        email: user.email
      });
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove both token and user from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Add useEffect to check for stored user on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Verify token is still valid
          const decoded = jwtDecode<{ 
            userId: string; 
            email: string; 
            role: string; 
            exp?: number;
            iat?: number;
          }>(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp && decoded.exp > currentTime) {
            // Token is valid, set user from localStorage
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } else {
            // Token expired
            logout();
          }
        } catch (error) {
          // Invalid token
          logout();
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};