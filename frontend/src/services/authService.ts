import { LoginCredentials, RegisterData, AuthResponse,  } from '../types/auth';
// User
// import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = data.error || response.statusText;
    throw new Error(error);
  }
  
  return data;
};

// Login user
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  
  return handleResponse(response);
};

// Register user
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  return handleResponse(response);
};

// Get user profile
// export const getProfile = async (decodedToken: any): Promise<{ success: boolean; data: User }> => {
//   console.log('decodedToken', decodedToken);
//   if (!decodedToken && !decodedToken.userId) {
//     throw new Error('Invalid token');
//   }

//   if (!decoded && !decoded.userId) {
//     throw new Error('Invalid token');
//   }

//   const response = await fetch(`${API_URL}/profile/${decoded.userId}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`,
//     },
//   });
  
//   return handleResponse(response);
// };

// Store token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
}; 